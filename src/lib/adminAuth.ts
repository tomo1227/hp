import crypto from "crypto";
import type { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";

const SESSION_COOKIE_NAME = "admin_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 14; // 14 days

const getSessionSecret = () => {
  const secret = process.env.NEXT_PUBLIC_ADMIN_PASSWORD_SECRET ?? "";
  if (!secret) {
    throw new Error("NEXT_PUBLIC_ADMIN_PASSWORD_SECRET is required");
  }
  return secret;
};

const sign = (payload: string) => {
  return crypto
    .createHmac("sha256", getSessionSecret())
    .update(payload)
    .digest("base64url");
};

export const buildSessionValue = () => {
  const expiresAt = Date.now() + SESSION_TTL_MS;
  const payload = Buffer.from(
    JSON.stringify({ exp: expiresAt }),
    "utf8",
  ).toString("base64url");
  const signature = sign(payload);
  return `${payload}.${signature}`;
};

export const verifySessionValue = (value?: string) => {
  if (!value) return false;
  const [payload, signature] = value.split(".");
  if (!payload || !signature) return false;
  const expected = sign(payload);
  const signatureBuf = Buffer.from(signature);
  const expectedBuf = Buffer.from(expected);
  if (signatureBuf.length !== expectedBuf.length) return false;
  if (!crypto.timingSafeEqual(signatureBuf, expectedBuf)) {
    return false;
  }
  try {
    const decoded = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    ) as { exp?: number };
    return typeof decoded.exp === "number" && decoded.exp > Date.now();
  } catch {
    return false;
  }
};

export const getAdminSession = (cookies: ReadonlyRequestCookies) => {
  return cookies.get(SESSION_COOKIE_NAME)?.value;
};

export const adminCookieName = SESSION_COOKIE_NAME;
export const adminSessionTtlMs = SESSION_TTL_MS;
