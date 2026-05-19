import { SubscribeButton } from "@/components/features/subscribeButton";
import { SubscribeGate } from "@/components/features/subscribeGate";
import { hasActiveSubscription } from "@/lib/subscription";

export default async function Page() {
  const isActive = await hasActiveSubscription();
  return (
    <div className="subscribe-shell">
      <div className="subscribe-card">
        <p className="subscribe-kicker">Membership</p>
        <h1 className="subscribe-title">月額500円で全記事を解放</h1>
        <p className="subscribe-copy">
          有料限定セクションや全文有料の記事、メンバー限定のお知らせや企画をすべて閲覧できます。
        </p>
        <div className="subscribe-price">
          <span className="subscribe-price-value">¥500</span>
          <span className="subscribe-price-unit">/ 月</span>
        </div>
        <ul className="subscribe-features">
          <li>ロックされた段落と全文有料記事の閲覧</li>
          <li>メンバー限定のお知らせや企画</li>
          <li>いつでも解約OK</li>
        </ul>
        <SubscribeGate locale="ja">
          {isActive && (
            <p className="subscribe-note">メンバーシップに登録済みです。</p>
          )}
          <SubscribeButton
            locale="ja"
            checkoutMode="inline"
            mode={isActive ? "portal-only" : "full"}
          />
        </SubscribeGate>
        <p className="subscribe-note">月額課金。税込み価格。</p>
        <p className="subscribe-alt">
          English? <a href="/en/membership">Go to English</a>
        </p>
      </div>
    </div>
  );
}
