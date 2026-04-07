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
  const { sessionId, paymentIntentId, setDefault } = (await request.json()) as {
    sessionId?: string;
    paymentIntentId?: string;
    setDefault?: boolean;
  };

  if (!sessionId && !paymentIntentId) {
    return NextResponse.json(
      { error: "sessionId or paymentIntentId is required" },
      { status: 400 },
    );
  }

  let customerId: string | null | undefined = null;

  if (sessionId) {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    customerId =
      typeof session.customer === "string"
        ? session.customer
        : session.customer?.id;
  } else if (paymentIntentId) {
    const intent = await stripe.paymentIntents.retrieve(paymentIntentId);
    customerId =
      typeof intent.customer === "string"
        ? intent.customer
        : intent.customer?.id;
  }

  if (!customerId) {
    return NextResponse.json({ error: "customer not found" }, { status: 400 });
  }

  if (paymentIntentId && setDefault) {
    const intent = await stripe.paymentIntents.retrieve(paymentIntentId);
    const paymentMethodId =
      typeof intent.payment_method === "string"
        ? intent.payment_method
        : intent.payment_method?.id;

    if (paymentMethodId) {
      await stripe.customers.update(customerId, {
        invoice_settings: { default_payment_method: paymentMethodId },
      });

      const subscriptions = await stripe.subscriptions.list({
        customer: customerId,
        status: "all",
        limit: 10,
      });
      const latest = subscriptions.data.sort(
        (a, b) => b.created - a.created,
      )[0];
      if (latest) {
        await stripe.subscriptions.update(latest.id, {
          default_payment_method: paymentMethodId,
        });
      }
    }
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
