import { MemberLoginPanel } from "@/components/features/memberLoginPanel";

export default function Page() {
  return (
    <div className="subscribe-shell">
      <div className="subscribe-card">
        <h1 className="subscribe-title">ログイン</h1>
        <p className="subscribe-copy">
          {/* メールまたはSNSでログインしてください。 */}
          メールでログインしてください。
          まだ登録していない方は、新規登録（無料）ページからご利用いただけます。
        </p>
        <MemberLoginPanel locale="ja" />
        <p className="subscribe-alt">
          プラン詳細を見る: <a href="/ja/membership">こちら</a>
        </p>
      </div>
    </div>
  );
}
