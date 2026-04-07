import { MemberLoginPanel } from "@/components/features/memberLoginPanel";

export default function EnLoginPage() {
  return (
    <div className="subscribe-shell">
      <div className="subscribe-card">
        <p className="subscribe-kicker">Membership</p>
        <h1 className="subscribe-title">Log in to your membership</h1>
        <p className="subscribe-copy">
          Sign in or create an account to open the member portal. New here?
          Start a subscription to unlock member content.
        </p>
        <MemberLoginPanel locale="en" />
        <p className="subscribe-alt">
          Want the plan details? <a href="/en/subscribe">See the plan</a>
        </p>
      </div>
    </div>
  );
}
