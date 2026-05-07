import { MemberLoginPanel } from "@/components/features/memberLoginPanel";

export default function Page() {
  return (
    <div className="subscribe-shell">
      <div className="subscribe-card">
        <h1 className="subscribe-title">Sign-in</h1>
        <p className="subscribe-copy">
          Sign in to open the member portal. New here? Create your account on
          the sign-up page to unlock member content.
        </p>
        <MemberLoginPanel locale="en" />
        <p className="subscribe-alt">
          Want the plan details? <a href="/en/subscribe">See the plan</a>
        </p>
      </div>
    </div>
  );
}
