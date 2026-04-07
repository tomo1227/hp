import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import {
  buildSubscriberValue,
  subscriberCookieName,
  subscriberSessionTtlMs,
} from "@/lib/subscriberAuth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const { sessionId } = (await request.json()) as { sessionId?: string };
  if (!sessionId) {
    return NextResponse.json(
      { error: "sessionId is required" },
      { status: 400 },
    );
  }

  const session = await stripe.checkout.sessions.retrieve(sessionId);
  const customerId =
    typeof session.customer === "string"
      ? session.customer
      : session.customer?.id;

  if (!customerId) {
    return NextResponse.json({ error: "customer not found" }, { status: 400 });
  }

  const expires = new Date(Date.now() + subscriberSessionTtlMs);
  const cookieStore = await cookies();
  cookieStore.set({
    name: subscriberCookieName,
    value: buildSubscriberValue(customerId),
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires,
  });

  return NextResponse.json({ ok: true });
}
