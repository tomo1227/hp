"use client";

import { fetchAuthSession } from "aws-amplify/auth";
import { useState } from "react";
import { configureAmplifyClient } from "@/components/features/amplifyProvider";
import { SubscribeEmbeddedCheckout } from "@/components/features/subscribeEmbeddedCheckout";

type Locale = "en" | "ja";

type SubscribeButtonProps = {
  locale?: Locale;
  mode?: "full" | "portal-only";
  requireAuth?: boolean;
  manageHref?: string;
  checkoutMode?: "redirect" | "inline";
};

const copy = {
  en: {
    checkout: "Start subscription",
    manage: "Manage subscription",
  },
  ja: {
    checkout: "メンバーシップに登録",
    manage: "登録内容の管理",
  },
};

export const SubscribeButton = ({
  locale = "en",
  mode = "full",
  requireAuth = true,
  manageHref,
  checkoutMode = "redirect",
}: SubscribeButtonProps) => {
  const [loading, setLoading] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const [error, setError] = useState("");
  const [showCheckout, setShowCheckout] = useState(false);
  const text = copy[locale] ?? copy.en;

  const handleCheckout = async () => {
    setLoading(true);
    setError("");
    try {
      configureAmplifyClient();
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
      if (checkoutMode === "inline") {
        setShowCheckout(true);
        return;
      }
      window.location.href = `/${locale}/membership/checkout`;
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
      configureAmplifyClient();
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
      {mode === "full" && !showCheckout && (
        <button type="button" onClick={handleCheckout} disabled={loading}>
          {loading ? (
            <span className="subscribe-button-content">
              <span className="subscribe-spinner" />
              {locale === "ja" ? "準備中" : "Preparing"}
            </span>
          ) : (
            text.checkout
          )}
        </button>
      )}
      {showCheckout && checkoutMode === "inline" && (
        <SubscribeEmbeddedCheckout locale={locale} />
      )}
      <button type="button" onClick={handlePortal} disabled={portalLoading}>
        {portalLoading ? (
          <span className="subscribe-button-content">
            <span className="subscribe-spinner" />
            {locale === "ja" ? "移動中" : "Opening"}
          </span>
        ) : (
          text.manage
        )}
      </button>
      {error && <p className="subscribe-error">{error}</p>}
    </div>
  );
};
