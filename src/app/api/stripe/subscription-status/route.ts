import { NextResponse } from "next/server";
import { verifyCognitoToken } from "@/lib/cognitoJwt";
import { stripe } from "@/lib/stripe";

export const runtime = "nodejs";

const isActiveStatus = (status: string) =>
  status === "active" || status === "trialing" || status === "past_due";

export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization") ?? "";
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();
  if (!token) {
    return NextResponse.json({ active: false }, { status: 401 });
  }

  let email = "";
  try {
    const payload = await verifyCognitoToken(token);
    email = payload.email ?? "";
  } catch {
    return NextResponse.json({ active: false }, { status: 401 });
  }

  if (!email) {
    return NextResponse.json({ active: false }, { status: 400 });
  }

  const escapedEmail = email.replace(/\\/g, "\\\\").replace(/'/g, "\\'");

  const search = await stripe.customers.search({
    query: `email:'${escapedEmail}'`,
    limit: 5,
  });

  if (search.data.length === 0) {
    return NextResponse.json({ active: false });
  }

  for (const customer of search.data) {
    const subscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      status: "all",
      limit: 5,
    });
    if (subscriptions.data.some((sub) => isActiveStatus(sub.status))) {
      return NextResponse.json({ active: true });
    }
  }

  return NextResponse.json({ active: false });
}
