"use client";

import { fetchAuthSession } from "aws-amplify/auth";
import { useState } from "react";

type Locale = "en" | "ja";

type SubscribeButtonProps = {
  locale?: Locale;
  mode?: "full" | "portal-only";
  requireAuth?: boolean;
  manageHref?: string;
};

const copy = {
  en: {
    checkout: "Start subscription",
    manage: "Manage subscription",
  },
  ja: {
    checkout: "サブスクを開始",
    manage: "サブスクを管理",
  },
};

export const SubscribeButton = ({
  locale = "en",
  mode = "full",
  requireAuth = true,
  manageHref,
}: SubscribeButtonProps) => {
  const [loading, setLoading] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const [error, setError] = useState("");
  const text = copy[locale] ?? copy.en;

  const handleCheckout = async () => {
    setLoading(true);
    setError("");
    try {
      if (requireAuth) {
        const session = await fetchAuthSession();
        const token = session.tokens?.idToken?.toString();
        if (!token) {
          throw new Error(
            locale === "ja"
              ? "ログインしてください。"
              : "Please sign in first.",
          );
        }
      }
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale }),
      });
      const data = (await response.json()) as { url?: string; error?: string };
      if (!response.ok || !data.url) {
        throw new Error(data.error || "Failed to start checkout");
      }
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  const handlePortal = async () => {
    setPortalLoading(true);
    setError("");
    try {
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();
      if (!token) {
        throw new Error(
          locale === "ja" ? "ログインしてください。" : "Please sign in first.",
        );
      }
      const target = manageHref ?? `/${locale}/member/portal`;
      window.location.href = target;
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setPortalLoading(false);
    }
  };

  return (
    <div className="subscribe-actions">
      {mode === "full" && (
        <button type="button" onClick={handleCheckout} disabled={loading}>
          {loading ? "..." : text.checkout}
        </button>
      )}
      <button type="button" onClick={handlePortal} disabled={portalLoading}>
        {portalLoading ? "..." : text.manage}
      </button>
      {error && <p className="subscribe-error">{error}</p>}
    </div>
  );
};
