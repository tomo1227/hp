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
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let email = "";
  try {
    const payload = await verifyCognitoToken(token);
    email = payload.email ?? "";
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  if (!email) {
    return NextResponse.json({ error: "Email not found" }, { status: 400 });
  }

  const payload = (await request.json().catch(() => ({}))) as {
    locale?: string;
  };
  const locale = payload.locale === "ja" ? "ja" : "en";
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://127.0.0.1:3000";
  const prefix = locale === "ja" ? "/ja" : "/en";

  const search = await stripe.customers.search({
    query: `email:'${email.replace(/\\/g, "\\\\").replace(/'/g, "\\'")}'`,
    limit: 5,
  });

  if (search.data.length === 0) {
    return NextResponse.json({ error: "customer not found" }, { status: 404 });
  }

  let customerId: string | null = null;

  for (const customer of search.data) {
    const subscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      status: "all",
      limit: 5,
    });
    if (
      subscriptions.data.some((sub: { status: string }) =>
        isActiveStatus(sub.status),
      )
    ) {
      customerId = customer.id;
      break;
    }
  }

  if (!customerId) {
    customerId = search.data[0].id;
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${baseUrl}${prefix}/membership`,
  });

  return NextResponse.json({ url: session.url });
}
