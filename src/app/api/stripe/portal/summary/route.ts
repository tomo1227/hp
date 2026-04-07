import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { getPortalCustomer } from "@/lib/stripePortal";

export const runtime = "nodejs";

type Subscription = {
  created: number;
  id?: string;
  default_payment_method?: string | { id: string } | null;
  status?: string;
  cancel_at_period_end?: boolean;
  current_period_end?: number;
  items?: {
    data?: {
      price?: { unit_amount?: number | null; currency?: string | null } | null;
    }[];
  } | null;
};

type PaymentMethod = {
  id: string;
  type: string;
  card?: {
    brand?: string | null;
    last4?: string | null;
    exp_month?: number | null;
    exp_year?: number | null;
    funding?: string | null;
    country?: string | null;
  } | null;
  billing_details?: {
    name?: string | null;
    email?: string | null;
    phone?: string | null;
    address?: {
      line1?: string | null;
      line2?: string | null;
      city?: string | null;
      state?: string | null;
      postal_code?: string | null;
      country?: string | null;
    } | null;
  } | null;
} | null;

const pickSubscription = (subs: Subscription[]) => {
  if (subs.length === 0) return null;
  return subs.sort((a, b) => b.created - a.created)[0];
};

export async function POST(request: Request) {
  const customerResult = await getPortalCustomer(request);
  if ("error" in customerResult) {
    return NextResponse.json(
      { error: customerResult.error },
      { status: customerResult.status },
    );
  }

  const { customer } = customerResult;
  const subscriptions = await stripe.subscriptions.list({
    customer: customer.id,
    status: "all",
    limit: 10,
  });
  const subscription = pickSubscription(subscriptions.data);

  const productIds = new Set<string>();
  for (const sub of subscriptions.data) {
    for (const item of sub.items?.data ?? []) {
      const productId =
        typeof item.price?.product === "string" ? item.price.product : null;
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

  const mappedSubscriptions = subscriptions.data.map((sub: any) => ({
    id: sub.id,
    status: sub.status ?? null,
    cancel_at_period_end: sub.cancel_at_period_end ?? null,
    current_period_end: sub.current_period_end ?? null,
    items: {
      data: (sub.items?.data ?? []).map((item: any) => ({
        price: item.price
          ? {
              unit_amount: item.price.unit_amount ?? null,
              currency: item.price.currency ?? null,
            }
          : null,
        priceId: item.price?.id ?? null,
        nickname: item.price?.nickname ?? null,
        productName:
          typeof item.price?.product === "string"
            ? (productNameById.get(item.price.product) ?? null)
            : null,
      })),
    },
  }));

  let paymentMethod: PaymentMethod = null;
  const rawCustomer = await stripe.customers.retrieve(customer.id);
  const invoiceDefault =
    typeof rawCustomer === "object" && "invoice_settings" in rawCustomer
      ? rawCustomer.invoice_settings?.default_payment_method
      : null;
  const methodSource = subscription?.default_payment_method ?? invoiceDefault;
  const defaultPaymentMethodId = methodSource
    ? typeof methodSource === "string"
      ? methodSource
      : methodSource.id
    : null;

  const methods = await stripe.paymentMethods.list({
    customer: customer.id,
    type: "card",
  });

  const mappedMethods = methods.data.map((method: any) => ({
    id: method.id,
    type: method.type,
    card: method.card
      ? {
          brand: method.card.brand,
          last4: method.card.last4,
          exp_month: method.card.exp_month,
          exp_year: method.card.exp_year,
          funding: method.card.funding,
          country: method.card.country,
        }
      : null,
    billing_details: method.billing_details
      ? {
          name: method.billing_details.name,
          email: method.billing_details.email,
          phone: method.billing_details.phone,
          address: method.billing_details.address,
        }
      : null,
  }));

  if (defaultPaymentMethodId) {
    paymentMethod =
      mappedMethods.find((method: PaymentMethod) =>
        method ? method.id === defaultPaymentMethodId : false,
      ) ?? null;
  }

  const invoices = await stripe.invoices.list({
    customer: customer.id,
    limit: 12,
  });

  return NextResponse.json({
    customer,
    subscription,
    subscriptions: mappedSubscriptions,
    paymentMethod,
    paymentMethods: mappedMethods,
    defaultPaymentMethodId,
    invoices: invoices.data,
  });
}
