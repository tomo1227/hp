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
      priceId?: string | null;
      nickname?: string | null;
      productName?: string | null;
    }[];
  } | null;
};

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
  const subscription = pickSubscription(subscriptions.data as Subscription[]);

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

  return NextResponse.json({
    subscription,
    subscriptions: mappedSubscriptions,
  });
}
