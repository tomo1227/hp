import { cookies } from "next/headers";
import { cache } from "react";
import { stripe } from "@/lib/stripe";
import {
  getSubscriberSession,
  readSubscriberPayload,
} from "@/lib/subscriberAuth";
import {
  getCachedSubscription,
  setCachedSubscription,
} from "@/lib/subscriptionCache";

const isActiveStatus = (status: string) =>
  status === "active" || status === "trialing" || status === "past_due";

const fetchSubscriptionStatus = cache(async (customerId: string) => {
  const cached = getCachedSubscription(customerId);
  if (cached !== null) return cached;
  const subscriptions = await stripe.subscriptions.list({
    customer: customerId,
    status: "all",
    limit: 5,
  });
  const active = subscriptions.data.some((sub: { status: string }) =>
    isActiveStatus(sub.status),
  );
  setCachedSubscription(customerId, active);
  return active;
});

export const getSubscriberCustomerId = async () => {
  const store = await cookies();
  const sessionValue = getSubscriberSession(store);
  const payload = readSubscriberPayload(sessionValue);
  return payload?.customerId ?? null;
};

export const hasActiveSubscription = async () => {
  const customerId = await getSubscriberCustomerId();
  if (!customerId) return false;
  return fetchSubscriptionStatus(customerId);
};
