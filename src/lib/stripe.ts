import Stripe from "stripe";

const stripeSecret = process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY ?? "";

if (!stripeSecret) {
  throw new Error("NEXT_PUBLIC_STRIPE_SECRET_KEY is required");
}

export const stripe = new Stripe(stripeSecret, {
  apiVersion: "2024-06-20",
});
