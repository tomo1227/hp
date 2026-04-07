import { SubscribeButton } from "@/components/features/subscribeButton";
import { SubscribeGate } from "@/components/features/subscribeGate";

export default function EnSubscribePage() {
  return (
    <div className="subscribe-shell">
      <div className="subscribe-card">
        <p className="subscribe-kicker">Membership</p>
        <h1 className="subscribe-title">One plan. All stories.</h1>
        <p className="subscribe-copy">
          Unlock member-only sections and full posts, plus exclusive
          announcements and events.
        </p>
        <div className="subscribe-price">
          <span className="subscribe-price-value">¥500</span>
          <span className="subscribe-price-unit">/ month</span>
        </div>
        <ul className="subscribe-features">
          <li>Full access to locked paragraphs and posts</li>
          <li>Member-only announcements and events</li>
          <li>Cancel anytime, no commitment</li>
        </ul>
        <SubscribeGate locale="en">
          <SubscribeButton locale="en" checkoutMode="inline" />
        </SubscribeGate>
        <p className="subscribe-note">Billed monthly. Taxes included.</p>
        <p className="subscribe-alt">
          Japanese? <a href="/ja/subscribe">Go to 日本語</a>
        </p>
      </div>
    </div>
  );
}
