import { NextResponse } from "next/server";
import type Stripe from "stripe";

import { stripe } from "@/lib/stripe";
import { getPortalCustomer } from "@/lib/stripePortal";

export const runtime = "nodejs";

type MappedPaymentMethod = {
  id: string;
  type: string;
  card: {
    brand: string | null;
    last4: string | null;
    exp_month: number | null;
    exp_year: number | null;
    funding: string | null;
    country: string | null;
  } | null;
  billing_details: {
    name: string | null;
    email: string | null;
    phone: string | null;
    address: Stripe.PaymentMethod.BillingDetails["address"] | null;
  } | null;
};

const pickSubscription = (
  subs: Stripe.ApiList<Stripe.Subscription>["data"],
) => {
  if (subs.length === 0) {
    return null;
  }

  return [...subs].sort((a, b) => b.created - a.created)[0];
};

const getCurrentPeriodEnd = (sub: Stripe.Subscription): number | null => {
  return (
    (sub as Stripe.Subscription & { current_period_end?: number | null })
      .current_period_end ?? null
  );
};

const getCancelAt = (sub: Stripe.Subscription): number | null => {
  return (
    (sub as Stripe.Subscription & { cancel_at?: number | null }).cancel_at ??
    null
  );
};

export async function POST(request: Request) {
  try {
    /**
     * Customer
     */
    const customerResult = await getPortalCustomer(request);

    if ("error" in customerResult) {
      return NextResponse.json(
        { error: customerResult.error },
        { status: customerResult.status },
      );
    }

    const { customer } = customerResult;

    /**
     * Subscriptions
     */
    const subscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      status: "all",
      limit: 10,
      expand: ["data.default_payment_method"],
    });

    const subscription = pickSubscription(subscriptions.data);

    /**
     * Product names
     */
    const productIds = new Set<string>();

    for (const sub of subscriptions.data) {
      for (const item of sub.items.data) {
        const productId =
          typeof item.price.product === "string"
            ? item.price.product
            : (item.price.product?.id ?? null);

        if (productId) {
          productIds.add(productId);
        }
      }
    }

    const productEntries = await Promise.all(
      Array.from(productIds).map(async (productId) => {
        const product = await stripe.products.retrieve(productId);

        return [productId, product.name ?? null] as const;
      }),
    );

    const productNameById = new Map(productEntries);

    /**
     * Subscriptions response
     */
    const mappedSubscriptions = subscriptions.data.map((sub) => ({
      id: sub.id,
      status: sub.status ?? null,
      cancel_at_period_end: sub.cancel_at_period_end ?? false,
      cancel_at: getCancelAt(sub),
      current_period_end: getCurrentPeriodEnd(sub),

      items: {
        data: sub.items.data.map((item) => {
          const productId =
            typeof item.price.product === "string"
              ? item.price.product
              : (item.price.product?.id ?? null);

          return {
            price: item.price
              ? {
                  unit_amount: item.price.unit_amount ?? null,
                  currency: item.price.currency ?? null,
                }
              : null,

            priceId: item.price?.id ?? null,
            nickname: item.price?.nickname ?? null,

            productName: productId
              ? (productNameById.get(productId) ?? null)
              : null,
          };
        }),
      },
    }));

    /**
     * Customer default payment method
     */
    const rawCustomer = await stripe.customers.retrieve(customer.id);

    const invoiceDefault = !("deleted" in rawCustomer)
      ? rawCustomer.invoice_settings.default_payment_method
      : null;

    const methodSource = subscription?.default_payment_method ?? invoiceDefault;

    const defaultPaymentMethodId = methodSource
      ? typeof methodSource === "string"
        ? methodSource
        : methodSource.id
      : null;

    /**
     * Payment methods
     */
    const methods = await stripe.paymentMethods.list({
      customer: customer.id,
      type: "card",
    });

    const mappedMethods: MappedPaymentMethod[] = methods.data.map((method) => ({
      id: method.id,
      type: method.type,

      card: method.card
        ? {
            brand: method.card.brand ?? null,
            last4: method.card.last4 ?? null,
            exp_month: method.card.exp_month ?? null,
            exp_year: method.card.exp_year ?? null,
            funding: method.card.funding ?? null,
            country: method.card.country ?? null,
          }
        : null,

      billing_details: method.billing_details
        ? {
            name: method.billing_details.name ?? null,
            email: method.billing_details.email ?? null,
            phone: method.billing_details.phone ?? null,
            address: method.billing_details.address ?? null,
          }
        : null,
    }));

    const paymentMethod = defaultPaymentMethodId
      ? (mappedMethods.find((method) => method.id === defaultPaymentMethodId) ??
        null)
      : null;

    return NextResponse.json({
      customer,

      subscription: subscription
        ? {
            id: subscription.id,
            status: subscription.status ?? null,
            cancel_at_period_end: subscription.cancel_at_period_end ?? false,
            cancel_at: getCancelAt(subscription),
            current_period_end: getCurrentPeriodEnd(subscription),
          }
        : null,

      subscriptions: mappedSubscriptions,

      paymentMethod,
      paymentMethods: mappedMethods,

      defaultPaymentMethodId,
    });
  } catch (error) {
    const stripeError = error as Stripe.StripeRawError;

    console.error("Stripe portal fetch error:", stripeError);

    return NextResponse.json(
      {
        error: stripeError.message || "Failed to fetch subscription data",
      },
      { status: 500 },
    );
  }
}
