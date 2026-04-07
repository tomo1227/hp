"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function JaSubscribeSuccessPage() {
  const params = useSearchParams();
  const [status, setStatus] = useState("購読状況を確認中...");
  const [error, setError] = useState("");

  useEffect(() => {
    const sessionId = params.get("session_id");
    if (!sessionId) {
      setError("session_id が見つかりません");
      setStatus("");
      return;
    }

    const confirm = async () => {
      try {
        const response = await fetch("/api/stripe/checkout-success", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId }),
        });
        if (!response.ok) {
          const data = (await response.json()) as { error?: string };
          throw new Error(data.error || "購読の確認に失敗しました");
        }
        setStatus("サブスクが有効になりました。ありがとうございます！");
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
        setStatus("");
      }
    };

    confirm();
  }, [params]);

  return (
    <div className="subscribe-shell">
      <div className="subscribe-card">
        <p className="subscribe-kicker">Membership</p>
        <h1 className="subscribe-title">購読ステータス</h1>
        {status && <p className="subscribe-copy">{status}</p>}
        {error && <p className="subscribe-error">{error}</p>}
        <Link className="subscribe-link" href="/ja">
          ホームへ戻る
        </Link>
        <p className="subscribe-alt">
          English? <a href="/en/subscribe/success">Go to English</a>
        </p>
      </div>
    </div>
  );
}
