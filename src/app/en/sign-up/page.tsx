import { MemberSignUpForm } from "@/components/features/memberSignUpForm";

export default function Page() {
  return (
    <div className="subscribe-shell">
      <div className="subscribe-card">
        <h1 className="subscribe-title">Sign up</h1>
        <p className="subscribe-copy">
          Create an account with your email and confirm it to continue.
        </p>
        <MemberSignUpForm locale="en" />
      </div>
    </div>
  );
}
