"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

type Locale = "ja" | "en";
export default function SubscribeSuccessPage({ locale }: { locale: Locale }) {
  const params = useSearchParams();
  const [status, setStatus] = useState(
    locale === "ja" ? "登録状況を確認中..." : "Checking subscription status...",
  );
  const [error, setError] = useState("");

  useEffect(() => {
    const sessionId = params.get("session_id");
    const paymentIntentId = params.get("payment_intent");
    const setDefault = params.get("set_default") === "1";

    if (!sessionId && !paymentIntentId) {
      setError(
        locale === "ja"
          ? "session_id が見つかりません"
          : "session_id not found",
      );
      setStatus("");
      return;
    }

    const confirm = async () => {
      try {
        const response = await fetch("/api/stripe/checkout-success", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId, paymentIntentId, setDefault }),
        });

        if (!response.ok) {
          const data = (await response.json()) as { error?: string };
          throw new Error(
            data.error ||
              (locale === "ja"
                ? "登録の確認に失敗しました"
                : "Failed to confirm subscription"),
          );
        }

        setStatus(
          locale === "ja"
            ? "有料コンテンツの閲覧が可能になりました。ありがとうございます！"
            : "Your subscription is now active. Thank you!",
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
        setStatus("");
      }
    };

    confirm();
  }, [params, locale]);

  return (
    <div className="subscribe-shell">
      <div className="subscribe-card">
        <p className="subscribe-kicker">
          {locale === "ja" ? "メンバーシップ" : "Membership"}
        </p>
        <h1 className="subscribe-title">
          {locale === "ja" ? "登録完了!" : "You've successfully registered!"}
        </h1>

        {status && <p className="subscribe-copy">{status}</p>}
        {error && <p className="subscribe-error">{error}</p>}

        <Link className="subscribe-link" href={`/${locale}/blogs`}>
          {locale === "ja" ? "ブログへ戻る" : "Back to Blog"}
        </Link>

        <p className="subscribe-alt">
          {locale === "ja" ? "English?" : "英語?"}{" "}
          <a href={`/${locale === "ja" ? "en" : "ja"}/membership/success`}>
            {locale === "ja" ? "Go to English" : "英語に切り替える"}
          </a>
        </p>
      </div>
    </div>
  );
}
