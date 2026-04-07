import crypto from "crypto";
import type { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";

const SUBSCRIBER_COOKIE_NAME = "subscriber_session";
const SUBSCRIBER_TTL_MS = 1000 * 60 * 60 * 24 * 60;

const getSubscriberSecret = () => {
  const secret = process.env.NEXT_PUBLIC_SUBSCRIBER_COOKIE_SECRET ?? "";
  if (!secret) {
    throw new Error("NEXT_PUBLIC_SUBSCRIBER_COOKIE_SECRET is required");
  }
  return secret;
};

const sign = (payload: string) => {
  return crypto
    .createHmac("sha256", getSubscriberSecret())
    .update(payload)
    .digest("base64url");
};

export const buildSubscriberValue = (customerId: string) => {
  const expiresAt = Date.now() + SUBSCRIBER_TTL_MS;
  const payload = Buffer.from(
    JSON.stringify({ customerId, exp: expiresAt }),
    "utf8",
  ).toString("base64url");
  const signature = sign(payload);
  return `${payload}.${signature}`;
};

type SubscriberPayload = {
  customerId: string;
  exp: number;
};

export const readSubscriberPayload = (value?: string) => {
  if (!value) return null;
  const [payload, signature] = value.split(".");
  if (!payload || !signature) return null;
  const expected = sign(payload);
  const signatureBuf = Buffer.from(signature);
  const expectedBuf = Buffer.from(expected);
  if (signatureBuf.length !== expectedBuf.length) return null;
  if (!crypto.timingSafeEqual(signatureBuf, expectedBuf)) {
    return null;
  }
  try {
    const decoded = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    ) as SubscriberPayload;
    if (!decoded.customerId || typeof decoded.exp !== "number") {
      return null;
    }
    if (decoded.exp < Date.now()) return null;
    return decoded;
  } catch {
    return null;
  }
};

export const getSubscriberSession = (cookies: ReadonlyRequestCookies) => {
  return cookies.get(SUBSCRIBER_COOKIE_NAME)?.value;
};

export const subscriberCookieName = SUBSCRIBER_COOKIE_NAME;
export const subscriberSessionTtlMs = SUBSCRIBER_TTL_MS;
