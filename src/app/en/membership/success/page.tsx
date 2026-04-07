import { Suspense } from "react";
import SubscribeSuccessPage from "@/components/features/membership/subscribeSuccessPage";

export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <SubscribeSuccessPage locale="en" />
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
