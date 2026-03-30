import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/adminApi";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({ ok: await isAdminRequest() });
}
