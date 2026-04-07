import { NextResponse } from "next/server";
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

  return NextResponse.json({ customer: customerResult.customer });
}
