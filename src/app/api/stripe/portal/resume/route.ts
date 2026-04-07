import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { getPortalCustomer } from "@/lib/stripePortal";

export const runtime = "nodejs";

type Subscription = {
  id: string;
  created: number;
  cancel_at_period_end?: boolean;
  status?: string;
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

  const payload = (await request.json().catch(() => ({}))) as {
    locale?: string;
    subscriptionId?: string;
    priceId?: string | null;
  };
  const locale = payload.locale === "ja" ? "ja" : "en";
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://127.0.0.1:3000";
  const prefix = locale === "ja" ? "/ja" : "/en";

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

  if (subscription.cancel_at_period_end) {
    const updated = await stripe.subscriptions.update(subscription.id, {
      cancel_at_period_end: false,
    });
    return NextResponse.json({ subscription: updated, resumed: true });
  }

  if (subscription.status === "canceled") {
    const priceId = payload.priceId ?? process.env.NEXT_PUBLIC_STRIPE_PRICE_ID;
    if (!priceId) {
      return NextResponse.json(
        { error: "NEXT_PUBLIC_STRIPE_PRICE_ID is required" },
        { status: 500 },
      );
    }
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerResult.customer.id,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${baseUrl}${prefix}/member/portal?resumed=1`,
      cancel_url: `${baseUrl}${prefix}/member/portal`,
      allow_promotion_codes: true,
    });
    return NextResponse.json({ url: session.url, restarted: true });
  }

  return NextResponse.json({ subscription, resumed: false });
}
