import { Suspense } from "react";
import AuthCallbackPage from "@/components/features/auth/authCallbackPage";

export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <AuthCallbackPage locale="ja" />
    </Suspense>
  );
}

function Loading() {
  return (
    <div className="subscribe-shell">
      <div className="subscribe-card">
        <p className="subscribe-copy">Loading...</p>
      </div>
    </div>
  );
}
