"use client";

import { fetchAuthSession, getCurrentUser } from "aws-amplify/auth";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { configureAmplifyClient } from "@/components/features/amplifyProvider";

export default function AuthCallbackPage() {
  const params = useSearchParams();
  const [status, setStatus] = useState("Signing you in...");
  const [detail, setDetail] = useState<string | null>(null);

  useEffect(() => {
    configureAmplifyClient();

    const finalize = async () => {
      try {
        const error = params.get("error");
        const errorDescription = params.get("error_description");

        if (error) {
          console.error("[Auth Callback] error", {
            error,
            errorDescription,
          });

          setDetail(
            `${error}${errorDescription ? `: ${errorDescription}` : ""}`,
          );
          setStatus("Sign-in failed. Please try again.");
          return;
        }

        await fetchAuthSession();
        await getCurrentUser();

        const state = params.get("state") ?? "";
        const nextLocale = state === "ja" ? "ja" : "en";

        window.location.href = `/${nextLocale}`;
      } catch (e) {
        console.error("Auth error:", e);
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
        {detail && <p className="subscribe-copy">{detail}</p>}
      </div>
    </div>
  );
}
