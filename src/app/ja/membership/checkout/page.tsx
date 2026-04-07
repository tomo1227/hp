import Link from "next/link";
import { SubscribeEmbeddedCheckout } from "@/components/features/subscribeEmbeddedCheckout";

export default function JaSubscribeCheckoutPage() {
  return (
    <div className="subscribe-shell">
      <div className="subscribe-card">
        <p className="subscribe-kicker">Membership</p>
        <h1 className="subscribe-title">メンバーシップ登録</h1>
        <p className="subscribe-copy">
          お支払い情報を入力して登録を完了してください。
        </p>
        <SubscribeEmbeddedCheckout locale="ja" />
        <p className="subscribe-alt">
          <Link href="/ja/membership">戻る</Link>
        </p>
      </div>
    </div>
  );
}
