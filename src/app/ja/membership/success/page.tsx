import { Suspense } from "react";
import SubscribeSuccessPage from "@/components/features/membership/subscribeSuccessPage";

export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <SubscribeSuccessPage locale="ja" />
    </Suspense>
  );
}

function Loading() {
  return (
    <div className="subscribe-shell">
      <div className="subscribe-card">
        <p className="subscribe-copy">読み込み中...</p>
      </div>
    </div>
  );
}
