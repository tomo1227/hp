"use client";

import { getCurrentUser } from "aws-amplify/auth";
import { Hub } from "aws-amplify/utils";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { configureAmplifyClient } from "@/components/features/amplifyProvider";

type Locale = "en" | "ja";

type SubscribeGateProps = {
  locale?: Locale;
  children: React.ReactNode;
};

const copy = {
  en: {
    title: "Sign in required",
    description: "Please sign in before starting a membership.",
    action: "Go to login",
  },
  ja: {
    title: "ログインが必要です",
    description: "メンバーシップ登録はログイン後に行えます。",
    action: "ログインへ",
  },
};

export const SubscribeGate = ({
  locale = "en",
  children,
}: SubscribeGateProps) => {
  const [signedIn, setSignedIn] = useState(false);
  const [checked, setChecked] = useState(false);
  const text = copy[locale] ?? copy.en;
  const prefix = locale === "ja" ? "/ja" : "/en";

  const refreshStatus = useCallback(async () => {
    try {
      await getCurrentUser();
      setSignedIn(true);
    } catch {
      setSignedIn(false);
    } finally {
      setChecked(true);
    }
  }, []);

  useEffect(() => {
    configureAmplifyClient({ locale });
    refreshStatus();
    const unsub = Hub.listen("auth", ({ payload }) => {
      if (payload.event === "signedIn" || payload.event === "signedOut") {
        refreshStatus();
      }
    });
    return () => {
      unsub();
    };
  }, [refreshStatus, locale]);

  if (!checked) {
    return <div className="subscribe-gate-loading">...</div>;
  }

  if (!signedIn) {
    return (
      <div className="subscribe-gate">
        <p className="subscribe-gate-title">{text.title}</p>
        <p className="subscribe-gate-copy">{text.description}</p>
        <Link className="subscribe-gate-link" href={`${prefix}/login`}>
          {text.action}
        </Link>
      </div>
    );
  }

  return <>{children}</>;
};
