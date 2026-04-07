import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { getSubscriberCustomerId } from "@/lib/subscription";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const customerId = await getSubscriberCustomerId();
  if (!customerId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = (await request.json().catch(() => ({}))) as {
    locale?: string;
  };
  const locale = payload.locale === "ja" ? "ja" : "en";
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://127.0.0.1:3000";
  const prefix = locale === "ja" ? "/ja" : "/en";

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${baseUrl}${prefix}/subscribe`,
  });

  return NextResponse.json({ url: session.url });
}
