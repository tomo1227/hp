"use client";

import { getCurrentUser } from "aws-amplify/auth";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function AuthCallbackPage() {
  const params = useSearchParams();
  const [status, setStatus] = useState("Signing you in...");

  useEffect(() => {
    const finalize = async () => {
      try {
        await getCurrentUser();
        const state = params.get("state") ?? "";
        const nextLocale = state === "ja" ? "ja" : "en";
        window.location.href = `/${nextLocale}`;
      } catch {
        setStatus("Sign-in failed. Please try again.");
      }
    };
    finalize();
  }, [params]);

  return (
    <div className="subscribe-shell">
      <div className="subscribe-card">
        <p className="subscribe-kicker">Membership</p>
        <h1 className="subscribe-title">Auth callback</h1>
        <p className="subscribe-copy">{status}</p>
      </div>
    </div>
  );
}
