import { NextResponse } from "next/server";
import { verifyCognitoToken } from "@/lib/cognitoJwt";
import { stripe } from "@/lib/stripe";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const priceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID;
  if (!priceId) {
    return NextResponse.json(
      { error: "NEXT_PUBLIC_STRIPE_PRICE_ID is required" },
      { status: 500 },
    );
  }

  const payload = (await request.json().catch(() => ({}))) as {
    locale?: string;
  };
  const locale = payload.locale === "ja" ? "ja" : "en";

  const authHeader = request.headers.get("authorization") ?? "";
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let email = "";
  try {
    const claims = await verifyCognitoToken(token);
    email = claims.email ?? "";
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!email) {
    return NextResponse.json({ error: "Email not found" }, { status: 400 });
  }

  const customerList = await stripe.customers.list({
    email,
    limit: 1,
  });
  const customer =
    customerList.data[0] ??
    (await stripe.customers.create({ email, metadata: { locale } }));
  const rawCustomer = await stripe.customers.retrieve(customer.id);
  const defaultPaymentMethodId =
    typeof rawCustomer === "object" && "invoice_settings" in rawCustomer
      ? rawCustomer.invoice_settings?.default_payment_method
      : null;
  const defaultPaymentMethod = defaultPaymentMethodId
    ? typeof defaultPaymentMethodId === "string"
      ? defaultPaymentMethodId
      : defaultPaymentMethodId.id
    : null;
  const defaultPaymentMethodDetails = defaultPaymentMethod
    ? await stripe.paymentMethods.retrieve(defaultPaymentMethod)
    : null;
  const paymentMethods = await stripe.paymentMethods.list({
    customer: customer.id,
    type: "card",
  });

  try {
    const existing = await stripe.subscriptions.list({
      customer: customer.id,
      status: "incomplete",
      limit: 1,
    });
    const existingSub = existing.data[0] ?? null;

    let subscription = existingSub
      ? await stripe.subscriptions.retrieve(existingSub.id, {
          expand: ["latest_invoice.payment_intent"],
        })
      : await stripe.subscriptions.create({
          customer: customer.id,
          items: [{ price: priceId, quantity: 1 }],
          ...(defaultPaymentMethod
            ? { default_payment_method: defaultPaymentMethod }
            : {}),
          payment_behavior: "default_incomplete",
          payment_settings: { save_default_payment_method: "off" },
          expand: ["latest_invoice.payment_intent"],
        });

    if (defaultPaymentMethod && !subscription.default_payment_method) {
      subscription = await stripe.subscriptions.update(subscription.id, {
        default_payment_method: defaultPaymentMethod,
        expand: ["latest_invoice.payment_intent"],
      });
    }

    const customerSession = await stripe.customerSessions.create({
      customer: customer.id,
      components: { payment_element: { enabled: true } },
    });

    const latestInvoice = subscription.latest_invoice as {
      payment_intent?: { client_secret?: string | null } | null;
    } | null;
    const clientSecret = latestInvoice?.payment_intent?.client_secret ?? null;
    if (!clientSecret) {
      return NextResponse.json(
        { error: "Failed to create payment intent" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      clientSecret,
      customerSessionClientSecret: customerSession.client_secret,
      defaultPaymentMethod: defaultPaymentMethodDetails
        ? {
            id: defaultPaymentMethodDetails.id,
            brand: defaultPaymentMethodDetails.card?.brand ?? null,
            last4: defaultPaymentMethodDetails.card?.last4 ?? null,
          }
        : null,
      defaultPaymentMethodId: defaultPaymentMethod,
      paymentMethods: paymentMethods.data.map((method) => ({
        id: method.id,
        brand: method.card?.brand ?? null,
        last4: method.card?.last4 ?? null,
        exp_month: method.card?.exp_month ?? null,
        exp_year: method.card?.exp_year ?? null,
      })),
    });
  } catch (error) {
    const stripeError = error as { code?: string; message?: string };
    if (stripeError.code === "customer_max_subscriptions") {
      console.warn(
        "Stripe test clock subscription limit reached:",
        stripeError.message,
      );
      return NextResponse.json(
        {
          error:
            locale === "ja"
              ? "現在サブスクを開始できません。"
              : "Unable to start subscription right now.",
        },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: stripeError.message || "Failed to create subscription" },
      { status: 500 },
    );
  }
}
