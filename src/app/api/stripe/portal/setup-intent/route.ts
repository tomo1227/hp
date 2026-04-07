import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { getPortalCustomer } from "@/lib/stripePortal";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const customerResult = await getPortalCustomer(request);
  if ("error" in customerResult) {
    return NextResponse.json(
      { error: customerResult.error },
      { status: customerResult.status },
    );
  }

  const intent = await stripe.setupIntents.create({
    customer: customerResult.customer.id,
    usage: "off_session",
  });

  return NextResponse.json({ clientSecret: intent.client_secret });
}
