import { NextResponse } from "next/server";
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
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://127.0.0.1:3000";
  const prefix = locale === "ja" ? "/ja" : "/en";

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${baseUrl}${prefix}/subscribe/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}${prefix}/subscribe?canceled=1`,
    allow_promotion_codes: true,
  });

  return NextResponse.json({ url: session.url });
}
