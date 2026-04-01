import Link from "next/link";

export default function Page() {
  return (
    <div className="contact-wrapper">
      <div className="contact-contents contact-thanks">
        <p className="contact-kicker">Thank you</p>
        <h1 className="contact-thanks-title">送信が完了しました</h1>
        <p className="contact-subtitle">
          お問い合わせありがとうございます。数日以内にご返信します。
        </p>
        <div className="contact-thanks-actions">
          <Link className="contact-link" href="/ja/contact">
            お問い合わせに戻る
          </Link>
          <Link className="contact-link" href="/ja/gallery">
            ギャラリーを見る
          </Link>
        </div>
      </div>
    </div>
  );
}
