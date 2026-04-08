import { MemberSignUpForm } from "@/components/features/memberSignUpForm";

export default function Page() {
  return (
    <div className="subscribe-shell">
      <div className="subscribe-card">
        <h1 className="subscribe-title">新規登録</h1>
        <p className="subscribe-copy">
          メールアドレスで登録し、確認コードで認証してください。
        </p>
        <MemberSignUpForm locale="ja" />
      </div>
    </div>
  );
}
