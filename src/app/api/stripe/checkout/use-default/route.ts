import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { verifyCognitoToken } from "@/lib/cognitoJwt";
import { stripe } from "@/lib/stripe";

export const runtime = "nodejs";

type InvoiceWithPaymentIntent = Stripe.Invoice & {
  payment_intent?: string | Stripe.PaymentIntent | null;
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
      return { customer: fullCustomer, defaultPaymentMethodId };
    }
  }

  return null;
};

const getInvoiceId = (latestInvoice: Stripe.Subscription["latest_invoice"]) => {
  if (!latestInvoice) return null;
  if (typeof latestInvoice === "string") return latestInvoice;
  return latestInvoice.id;
};

export async function POST(request: Request) {
  const priceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID;

  if (!priceId) {
    return NextResponse.json(
      { error: "NEXT_PUBLIC_STRIPE_PRICE_ID is required" },
      { status: 500 },
    );
  }

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

  const payload = (await request.json().catch(() => ({}))) as {
    paymentMethodId?: string;
  };
  const requestedPaymentMethodId = payload.paymentMethodId?.trim() || null;

  try {
    const selected = await findCustomerWithDefaultPaymentMethod(email);

    if (!selected) {
      return NextResponse.json(
        {
          error:
            "No saved default payment method found. Please choose a new card.",
        },
        { status: 400 },
      );
    }

    const customer = selected.customer;

    const existing = await stripe.subscriptions.list({
      customer: customer.id,
      status: "incomplete",
      limit: 1,
    });

    const existingSub = existing.data[0] ?? null;

    const subscriptionExpand: string[] = ["latest_invoice.payment_intent"];

    const subscription = existingSub
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

    const fallbackDefaultPaymentMethodId = selected.defaultPaymentMethodId;
    const paymentMethodIdToUse =
      requestedPaymentMethodId ?? fallbackDefaultPaymentMethodId;

    if (!paymentMethodIdToUse) {
      return NextResponse.json(
        {
          error:
            "No saved default payment method found. Please choose a new card.",
        },
        { status: 400 },
      );
    }

    const selectedPaymentMethod =
      await stripe.paymentMethods.retrieve(paymentMethodIdToUse);

    const attachedCustomerId =
      typeof selectedPaymentMethod.customer === "string"
        ? selectedPaymentMethod.customer
        : selectedPaymentMethod.customer?.id;

    if (attachedCustomerId !== customer.id) {
      return NextResponse.json(
        { error: "Selected payment method is invalid" },
        { status: 400 },
      );
    }

    const invoiceId = getInvoiceId(subscription.latest_invoice);

    if (!invoiceId) {
      return NextResponse.json(
        { error: "Failed to resolve invoice" },
        { status: 500 },
      );
    }

    const invoice = await stripe.invoices.pay(invoiceId, {
      payment_method: paymentMethodIdToUse,
    });

    const paidInvoice = await stripe.invoices.retrieve(invoice.id, {
      expand: ["payment_intent"],
    });

    const invoiceWithPaymentIntent = paidInvoice as InvoiceWithPaymentIntent;

    const paymentIntentId =
      typeof invoiceWithPaymentIntent.payment_intent === "string"
        ? invoiceWithPaymentIntent.payment_intent
        : (invoiceWithPaymentIntent.payment_intent?.id ?? null);

    return NextResponse.json({
      ok: true,
      paymentIntentId,
    });
  } catch (error) {
    const stripeError = error as Stripe.StripeRawError;
    return NextResponse.json(
      {
        error:
          stripeError.message || "Failed to pay with default payment method",
      },
      { status: 500 },
    );
  }
}
