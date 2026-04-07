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

  const payload = (await request.json().catch(() => ({}))) as {
    name?: string;
    phone?: string;
    address?: {
      line1?: string;
      line2?: string;
      city?: string;
      state?: string;
      postal_code?: string;
      country?: string;
    };
  };

  const updated = await stripe.customers.update(customerResult.customer.id, {
    name: payload.name ?? undefined,
    phone: payload.phone ?? undefined,
    address: payload.address ?? undefined,
  });

  return NextResponse.json({
    ok: true,
    customer: {
      id: updated.id,
      email: updated.email,
      name: updated.name,
      phone: updated.phone,
      address: updated.address,
    },
  });
}
