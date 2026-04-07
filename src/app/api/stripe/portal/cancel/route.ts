import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { getPortalCustomer } from "@/lib/stripePortal";

export const runtime = "nodejs";

type Subscription = { id: string; created: number };

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

  const payload = (await request.json().catch(() => ({}))) as {
    subscriptionId?: string;
  };

  const subscriptions = await stripe.subscriptions.list({
    customer: customerResult.customer.id,
    status: "all",
    limit: 10,
  });
  const subscription = payload.subscriptionId
    ? (subscriptions.data.find((sub) => sub.id === payload.subscriptionId) ??
      null)
    : pickSubscription(subscriptions.data);

  if (!subscription) {
    return NextResponse.json(
      { error: "subscription not found" },
      { status: 404 },
    );
  }

  const updated = await stripe.subscriptions.update(subscription.id, {
    cancel_at_period_end: true,
  });

  return NextResponse.json({ subscription: updated });
}
