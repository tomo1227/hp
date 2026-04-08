"use client";

import { fetchAuthSession, getCurrentUser } from "aws-amplify/auth";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { configureAmplifyClient } from "@/components/features/amplifyProvider";

type Locale = "ja" | "en";

const messages = {
  en: {
    signingIn: "Signing you in… You will be redirected automatically.",
    failed: "Failed to sign in. Please try again.",
    title: "Welcome",
  },
  ja: {
    signingIn: "ログイン中… 自動で次のページに移動します。",
    failed: "ログインに失敗しました。もう一度お試しください。",
    title: "ようこそ",
  },
};

export default function AuthCallbackPage({
  locale = "ja",
}: {
  locale?: Locale;
}) {
  const params = useSearchParams();
  const t = messages[locale];

  const [status, setStatus] = useState(t.signingIn);
  const [detail, setDetail] = useState<string | null>(null);

  useEffect(() => {
    configureAmplifyClient({ locale });

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
          setStatus(t.failed);
          return;
        }

        await fetchAuthSession();
        await getCurrentUser();

        const nextLocale = locale === "ja" ? "ja/blogs" : "en/blogs";

        window.location.href = `/${nextLocale}`;
      } catch (e) {
        console.error("Auth error:", e);
        setStatus(t.failed);
      }
    };

    finalize();
  }, [params, locale, t]);

  return (
    <div className="subscribe-shell">
      <div className="subscribe-card">
        <p className="subscribe-kicker">Membership</p>
        <h1 className="subscribe-title">{t.title}</h1>
        <p className="subscribe-copy">{status}</p>
        {detail && <p className="subscribe-copy">{detail}</p>}
      </div>
    </div>
  );
}
