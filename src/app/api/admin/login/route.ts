import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  adminCookieName,
  adminSessionTtlMs,
  buildSessionValue,
} from "@/lib/adminAuth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const { password } = (await request.json()) as { password?: string };
  const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD_SECRET;

  if (!adminPassword || !password || password !== adminPassword) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sessionValue = buildSessionValue();
  const expires = new Date(Date.now() + adminSessionTtlMs);

  const cookieStore = await cookies();
  cookieStore.set({
    name: adminCookieName,
    value: sessionValue,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires,
  });

  return NextResponse.json({ ok: true });
}
