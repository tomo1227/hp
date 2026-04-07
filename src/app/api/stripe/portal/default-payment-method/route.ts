import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { getPortalCustomer } from "@/lib/stripePortal";

export const runtime = "nodejs";

type Subscription = {
  created: number;
  id: string;
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
  const body = (await request.json()) as { paymentMethodId?: string };
  if (!body.paymentMethodId) {
    return NextResponse.json(
      { error: "paymentMethodId is required" },
      { status: 400 },
    );
  }

  const paymentMethod = await stripe.paymentMethods.retrieve(
    body.paymentMethodId,
  );
  if (
    !paymentMethod ||
    typeof paymentMethod !== "object" ||
    paymentMethod.customer !== customer.id
  ) {
    return NextResponse.json(
      { error: "Invalid payment method" },
      { status: 403 },
    );
  }

  await stripe.customers.update(customer.id, {
    invoice_settings: { default_payment_method: body.paymentMethodId },
  });

  const subscriptions = await stripe.subscriptions.list({
    customer: customer.id,
    status: "all",
    limit: 10,
  });
  const subscription = pickSubscription(subscriptions.data as Subscription[]);
  if (subscription) {
    await stripe.subscriptions.update(subscription.id, {
      default_payment_method: body.paymentMethodId,
    });
  }

  return NextResponse.json({ ok: true });
}
