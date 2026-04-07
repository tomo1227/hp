"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function EnSubscribeSuccessPage() {
  const params = useSearchParams();
  const [status, setStatus] = useState("Checking subscription...");
  const [error, setError] = useState("");

  useEffect(() => {
    const sessionId = params.get("session_id");
    if (!sessionId) {
      setError("Missing session_id");
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
          throw new Error(data.error || "Failed to confirm subscription");
        }
        setStatus("Subscription activated. Thank you!");
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
        <h1 className="subscribe-title">Subscription status</h1>
        {status && <p className="subscribe-copy">{status}</p>}
        {error && <p className="subscribe-error">{error}</p>}
        <Link className="subscribe-link" href="/en">
          Back to home
        </Link>
        <p className="subscribe-alt">
          Japanese? <a href="/ja/subscribe/success">Go to 日本語</a>
        </p>
      </div>
    </div>
  );
}
