import { MemberLoginPanel } from "@/components/features/memberLoginPanel";

export default function JaLoginPage() {
  return (
    <div className="subscribe-shell">
      <div className="subscribe-card">
        <p className="subscribe-kicker">Membership</p>
        <h1 className="subscribe-title">メンバーシップにログイン</h1>
        <p className="subscribe-copy">
          メールまたはSNSでログインして、メンバーポータルを開いてください。まだの方
          はサブスク登録をお願いします。
        </p>
        <MemberLoginPanel locale="ja" />
        <p className="subscribe-alt">
          プラン詳細を見る: <a href="/ja/subscribe">こちら</a>
        </p>
      </div>
    </div>
  );
}
