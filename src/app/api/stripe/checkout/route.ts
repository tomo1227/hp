import { NextResponse } from "next/server";
import type Stripe from "stripe";
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

  try {
    /**
     * Customer
     */
    const customerList = await stripe.customers.list({
      email,
      limit: 1,
    });

    const customer =
      customerList.data[0] ??
      (await stripe.customers.create({
        email,
        metadata: { locale },
      }));

    /**
     * Default payment method
     */
    const rawCustomer = await stripe.customers.retrieve(customer.id);

    const defaultPaymentMethodId =
      !("deleted" in rawCustomer) &&
      rawCustomer.invoice_settings.default_payment_method
        ? typeof rawCustomer.invoice_settings.default_payment_method ===
          "string"
          ? rawCustomer.invoice_settings.default_payment_method
          : rawCustomer.invoice_settings.default_payment_method.id
        : null;

    const defaultPaymentMethodDetails = defaultPaymentMethodId
      ? await stripe.paymentMethods.retrieve(defaultPaymentMethodId)
      : null;

    /**
     * Customer payment methods
     */
    const paymentMethods = await stripe.paymentMethods.list({
      customer: customer.id,
      type: "card",
    });

    /**
     * Existing incomplete subscription
     */
    const existing = await stripe.subscriptions.list({
      customer: customer.id,
      status: "incomplete",
      limit: 1,
    });

    const existingSub = existing.data[0] ?? null;

    /**
     * Subscription
     */
    const subscription = existingSub
      ? await stripe.subscriptions.retrieve(existingSub.id, {
          expand: ["latest_invoice.payment_intent"],
        })
      : await stripe.subscriptions.create({
          customer: customer.id,
          items: [{ price: priceId, quantity: 1 }],
          ...(defaultPaymentMethodId
            ? {
                default_payment_method: defaultPaymentMethodId,
              }
            : {}),
          payment_behavior: "default_incomplete",
          payment_settings: {
            save_default_payment_method: "on_subscription",
          },
          expand: ["latest_invoice.payment_intent"],
        });

    /**
     * Customer session
     */
    const customerSession = await stripe.customerSessions.create({
      customer: customer.id,
      components: {
        payment_element: {
          enabled: true,
        },
      },
    });

    /**
     * PaymentIntent client secret
     */
    const latestInvoice =
      typeof subscription.latest_invoice === "string"
        ? null
        : subscription.latest_invoice;

    const invoiceWithPaymentIntent = latestInvoice as
      | (Stripe.Invoice & {
          payment_intent?: string | Stripe.PaymentIntent | null;
        })
      | null;

    const paymentIntent =
      invoiceWithPaymentIntent?.payment_intent &&
      typeof invoiceWithPaymentIntent.payment_intent !== "string"
        ? invoiceWithPaymentIntent.payment_intent
        : null;

    const clientSecret = paymentIntent?.client_secret ?? null;

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

      defaultPaymentMethodId,

      paymentMethods: paymentMethods.data.map((method) => ({
        id: method.id,
        brand: method.card?.brand ?? null,
        last4: method.card?.last4 ?? null,
        exp_month: method.card?.exp_month ?? null,
        exp_year: method.card?.exp_year ?? null,
      })),
    });
  } catch (error) {
    const stripeError = error as Stripe.StripeRawError;

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

    console.error("Stripe subscription error:", stripeError);

    return NextResponse.json(
      {
        error: stripeError.message || "Failed to create subscription",
      },
      { status: 500 },
    );
  }
}
