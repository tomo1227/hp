import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { getPortalCustomer } from "@/lib/stripePortal";

export const runtime = "nodejs";

type InvoiceRequest = {
  year?: number;
  month?: number;
};

export async function POST(request: Request) {
  const customerResult = await getPortalCustomer(request);
  if ("error" in customerResult) {
    return NextResponse.json(
      { error: customerResult.error },
      { status: customerResult.status },
    );
  }

  const body = (await request.json()) as InvoiceRequest;
  const year = typeof body.year === "number" ? body.year : null;
  const month = typeof body.month === "number" ? body.month : null;

  let created: { gte?: number; lt?: number } | undefined;
  if (year) {
    const start = new Date(Date.UTC(year, month ? month - 1 : 0, 1));
    const end = month
      ? new Date(Date.UTC(year, month, 1))
      : new Date(Date.UTC(year + 1, 0, 1));
    created = {
      gte: Math.floor(start.getTime() / 1000),
      lt: Math.floor(end.getTime() / 1000),
    };
  }

  const invoices = await stripe.invoices.list({
    customer: customerResult.customer.id,
    limit: 30,
    ...(created ? { created } : {}),
  });

  const mapped = invoices.data
    .filter((invoice) => invoice.status === "paid")
    .map((invoice) => ({
      id: invoice.id,
      number: invoice.number ?? null,
      created: invoice.created ?? null,
      amount_paid: invoice.amount_paid ?? null,
      amount_due: invoice.amount_due ?? null,
      currency: invoice.currency ?? null,
      invoice_pdf: invoice.invoice_pdf ?? null,
      hosted_invoice_url: invoice.hosted_invoice_url ?? null,
    }));

  return NextResponse.json({ invoices: mapped });
}
