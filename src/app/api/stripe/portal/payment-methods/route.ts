import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { getPortalCustomer } from "@/lib/stripePortal";

export const runtime = "nodejs";

type Subscription = {
  created: number;
  id?: string;
  default_payment_method?: string | { id: string } | null;
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
  const [subscriptions, rawCustomer, methods] = await Promise.all([
    stripe.subscriptions.list({
      customer: customer.id,
      status: "all",
      limit: 10,
    }),
    stripe.customers.retrieve(customer.id),
    stripe.paymentMethods.list({
      customer: customer.id,
      type: "card",
    }),
  ]);

  const subscription = pickSubscription(subscriptions.data as Subscription[]);
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

  const paymentMethod = defaultPaymentMethodId
    ? (mappedMethods.find((method: PaymentMethod) =>
        method ? method.id === defaultPaymentMethodId : false,
      ) ?? null)
    : null;

  return NextResponse.json({
    paymentMethod,
    paymentMethods: mappedMethods,
    defaultPaymentMethodId,
  });
}
