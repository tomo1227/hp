import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { verifyCognitoToken } from "@/lib/cognitoJwt";
import { stripe } from "@/lib/stripe";

export const runtime = "nodejs";

type InvoiceWithSecrets = Stripe.Invoice & {
  payment_intent?: string | Stripe.PaymentIntent | null;
  confirmation_secret?: {
    client_secret?: string | null;
  } | null;
};

const getDefaultPaymentMethodId = (
  subscription: Stripe.Subscription,
  customer: Stripe.Customer,
) => {
  const subscriptionDefault = subscription.default_payment_method;
  if (subscriptionDefault) {
    return typeof subscriptionDefault === "string"
      ? subscriptionDefault
      : subscriptionDefault.id;
  }

  const customerDefault = customer.invoice_settings?.default_payment_method;
  if (!customerDefault) {
    return null;
  }

  return typeof customerDefault === "string"
    ? customerDefault
    : customerDefault.id;
};

const findCustomerWithDefaultPaymentMethod = async (email: string) => {
  const escapedEmail = email.replace(/\\/g, "\\\\").replace(/'/g, "\\'");

  const search = await stripe.customers.search({
    query: `email:'${escapedEmail}'`,
    limit: 10,
  });

  for (const rawCustomer of search.data) {
    if ("deleted" in rawCustomer && rawCustomer.deleted) {
      continue;
    }

    const subscriptions = await stripe.subscriptions.list({
      customer: rawCustomer.id,
      status: "all",
      limit: 10,
    });

    const latest = subscriptions.data.sort((a, b) => b.created - a.created)[0];
    if (!latest) {
      continue;
    }

    const fullCustomer = await stripe.customers.retrieve(rawCustomer.id);
    if ("deleted" in fullCustomer && fullCustomer.deleted) {
      continue;
    }

    const defaultPaymentMethodId = getDefaultPaymentMethodId(
      latest,
      fullCustomer,
    );

    if (defaultPaymentMethodId) {
      return { customer: fullCustomer, hasDefaultPaymentMethod: true };
    }
  }

  const fallback = search.data.find(
    (customer) => !("deleted" in customer && customer.deleted),
  );

  if (!fallback) {
    return null;
  }

  const fullFallback = await stripe.customers.retrieve(fallback.id);
  if ("deleted" in fullFallback && fullFallback.deleted) {
    return null;
  }

  return { customer: fullFallback, hasDefaultPaymentMethod: false };
};

const getMappedCardPaymentMethods = async (customerId: string) => {
  const methods = await stripe.paymentMethods.list({
    customer: customerId,
    type: "card",
  });

  return methods.data.map((method) => ({
    id: method.id,
    card: method.card
      ? {
          brand: method.card.brand,
          last4: method.card.last4,
          exp_month: method.card.exp_month,
          exp_year: method.card.exp_year,
        }
      : null,
  }));
};

const getInvoiceClientSecret = (
  latestInvoice: Stripe.Subscription["latest_invoice"],
) => {
  if (!latestInvoice || typeof latestInvoice === "string") {
    return null;
  }

  const invoice = latestInvoice as InvoiceWithSecrets;

  if (
    invoice.payment_intent &&
    typeof invoice.payment_intent !== "string" &&
    invoice.payment_intent.client_secret
  ) {
    return invoice.payment_intent.client_secret;
  }

  if (invoice.confirmation_secret?.client_secret) {
    return invoice.confirmation_secret.client_secret;
  }

  return null;
};

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
    const selected = await findCustomerWithDefaultPaymentMethod(email);

    const customer =
      selected?.customer ??
      (await stripe.customers.create({
        email,
        metadata: { locale },
      }));

    /**
     * Existing incomplete subscription
     */
    const existing = await stripe.subscriptions.list({
      customer: customer.id,
      status: "incomplete",
      limit: 1,
    });

    const existingSub = existing.data[0] ?? null;

    const subscriptionExpand: string[] = [
      "latest_invoice.payment_intent",
      "latest_invoice.confirmation_secret",
    ];

    /**
     * Subscription
     */
    let subscription = existingSub
      ? await stripe.subscriptions.retrieve(existingSub.id, {
          expand: subscriptionExpand,
        })
      : await stripe.subscriptions.create({
          customer: customer.id,
          items: [{ price: priceId, quantity: 1 }],
          payment_behavior: "default_incomplete",
          payment_settings: {
            save_default_payment_method: "on_subscription",
          },
          expand: subscriptionExpand,
        });

    /**
     * Client secret
     */
    let clientSecret = getInvoiceClientSecret(subscription.latest_invoice);

    if (!clientSecret && existingSub) {
      subscription = await stripe.subscriptions.create({
        customer: customer.id,
        items: [{ price: priceId, quantity: 1 }],
        payment_behavior: "default_incomplete",
        payment_settings: {
          save_default_payment_method: "on_subscription",
        },
        expand: subscriptionExpand,
      });

      clientSecret = getInvoiceClientSecret(subscription.latest_invoice);
    }

    if (!clientSecret) {
      return NextResponse.json(
        { error: "Failed to create payment intent" },
        { status: 500 },
      );
    }

    const customerForDefault =
      "deleted" in customer && customer.deleted ? null : customer;
    const defaultPaymentMethodId = customerForDefault
      ? getDefaultPaymentMethodId(subscription, customerForDefault)
      : null;

    const paymentMethods = await getMappedCardPaymentMethods(customer.id);

    return NextResponse.json({
      clientSecret,
      hasDefaultPaymentMethod: Boolean(defaultPaymentMethodId),
      defaultPaymentMethodId,
      paymentMethods,
    });
  } catch (error) {
    const stripeError = error as Stripe.StripeRawError;

    if (stripeError.code === "customer_max_subscriptions") {
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
