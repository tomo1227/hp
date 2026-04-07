import Link from "next/link";
import { SubscribeEmbeddedCheckout } from "@/components/features/subscribeEmbeddedCheckout";

export default function EnSubscribeCheckoutPage() {
  return (
    <div className="subscribe-shell">
      <div className="subscribe-card">
        <p className="subscribe-kicker">Membership</p>
        <h1 className="subscribe-title">Complete your subscription</h1>
        <p className="subscribe-copy">
          Enter your payment details to finish the signup.
        </p>
        <SubscribeEmbeddedCheckout locale="en" />
        <p className="subscribe-alt">
          <Link href="/en/membership">Back</Link>
        </p>
      </div>
    </div>
  );
}
