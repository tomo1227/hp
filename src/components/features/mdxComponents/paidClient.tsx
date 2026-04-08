"use client";

import { fetchAuthSession } from "aws-amplify/auth";
import { Hub } from "aws-amplify/utils";
import Link from "next/link";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { configureAmplifyClient } from "@/components/features/amplifyProvider";

type Locale = "en" | "ja";

type PaidClientProps = {
  locale?: Locale;
  title?: string;
  description?: string;
  children?: ReactNode;
};

const copy = {
  en: {
    title: "Subscriber-only section",
    description: "Subscribe to unlock this part of the post.",
    subscribe: "Subscribe",
    login: "Log in",
  },
  ja: {
    title: "メンバーシップ限定コンテンツ",
    description: "この先はメンバーシップ会員に登録すると読めます。",
    subscribe: "メンバーシップ登録",
    login: "ログイン",
  },
};

export const PaidClient = ({
  locale = "en",
  title,
  description,
  children,
}: PaidClientProps) => {
  const [allowed, setAllowed] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    configureAmplifyClient({ locale });
    let active = true;
    const timeoutId = window.setTimeout(() => {
      if (!active) return;
      setAllowed(false);
      setChecked(true);
    }, 3000);

    const load = async () => {
      try {
        const authTimeoutId = window.setTimeout(() => {
          if (!active) return;
          setChecked(true);
        }, 1200);
        const session = await fetchAuthSession();
        window.clearTimeout(authTimeoutId);
        const idToken = session.tokens?.idToken?.toString() ?? "";
        if (!idToken) {
          if (active) {
            setChecked(true);
          }
          return;
        }
        const controller = new AbortController();
        const fetchTimeout = window.setTimeout(() => controller.abort(), 5000);
        const response = await fetch("/api/stripe/subscription-status", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
          signal: controller.signal,
        });
        window.clearTimeout(fetchTimeout);
        const data = (await response.json()) as { active?: boolean };
        if (active) {
          setAllowed(Boolean(data.active));
        }
      } catch {
        if (active) {
          setAllowed(false);
        }
      } finally {
        if (active) {
          setChecked(true);
        }
        window.clearTimeout(timeoutId);
      }
    };
    load();
    const unsub = Hub.listen("auth", ({ payload }) => {
      if (payload.event === "signedIn" || payload.event === "signedOut") {
        load();
      }
    });
    return () => {
      active = false;
      window.clearTimeout(timeoutId);
      unsub();
    };
  }, []);

  if (!checked) {
    return (
      <div className="portal-loading" aria-busy="true">
        <span className="portal-spinner" aria-hidden="true" />
        <span>{locale === "ja" ? "読み込み中..." : "Loading..."}</span>
      </div>
    );
  }

  if (allowed) {
    return <div className="paid-content">{children}</div>;
  }

  const text = copy[locale] ?? copy.en;
  const prefix = locale === "ja" ? "/ja" : "/en";
  return (
    <div className="paid-locked">
      <div className="paid-blur" aria-hidden="true">
        <div className="paid-line" />
        <div className="paid-line" />
        <div className="paid-line" />
        <div className="paid-line short" />
      </div>
      <div className="paid-overlay">
        <p className="paid-title">{title ?? text.title}</p>
        <p className="paid-description">{description ?? text.description}</p>
        <div className="paid-actions">
          <Link className="paid-button" href={`${prefix}/membership`}>
            {text.subscribe}
          </Link>
          <Link
            className="paid-button paid-button-secondary"
            href={`${prefix}/login`}
          >
            {text.login}
          </Link>
        </div>
      </div>
    </div>
  );
};
