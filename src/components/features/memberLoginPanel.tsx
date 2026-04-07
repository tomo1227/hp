"use client";

import { getCurrentUser, signOut } from "aws-amplify/auth";
import { Hub } from "aws-amplify/utils";
import { useCallback, useEffect, useState } from "react";
import { configureAmplifyClient } from "@/components/features/amplifyProvider";
// import { AuthButtons } from "@/components/features/authButtons";
import { MemberAuthForm } from "@/components/features/memberAuthForm";

type Locale = "en" | "ja";

type MemberLoginPanelProps = {
  locale?: Locale;
};

const copy = {
  en: {
    signedInTitle: "You are signed in",
    signedInAs: "Signed in as",
    portal: "Open member portal",
    signOut: "Sign out",
    // or: "or",
  },
  ja: {
    signedInTitle: "ログイン済みです",
    signedInAs: "ログイン中",
    portal: "メンバーポータルを開く",
    signOut: "ログアウト",
    // or: "または",
  },
};

export const MemberLoginPanel = ({ locale = "en" }: MemberLoginPanelProps) => {
  const [username, setUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checked, setChecked] = useState(false);
  const text = copy[locale] ?? copy.en;

  const refreshUser = useCallback(async () => {
    try {
      const current = await getCurrentUser();
      setUsername(current.username ?? null);
    } catch {
      setUsername(null);
    } finally {
      setChecked(true);
    }
  }, []);

  useEffect(() => {
    configureAmplifyClient();
    refreshUser();
    const unsub = Hub.listen("auth", ({ payload }) => {
      if (payload.event === "signedIn" || payload.event === "signedOut") {
        refreshUser();
      }
    });
    return () => {
      unsub();
    };
  }, [refreshUser]);

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await signOut();
      setUsername(null);
    } finally {
      setLoading(false);
    }
  };

  if (!checked) {
    return <div className="member-login-loading">...</div>;
  }

  if (username) {
    return (
      <div className="member-login-signed">
        <p className="member-login-title">{text.signedInTitle}</p>
        <p className="member-login-sub">
          {text.signedInAs}: {username}
        </p>
        <div className="member-login-actions">
          <a className="member-login-primary" href={`/${locale}/member/portal`}>
            {text.portal}
          </a>
          <a className="member-login-secondary" href={`/${locale}/membership`}>
            {locale === "ja" ? "メンバーシップ登録" : "Subscribe to Membership"}
          </a>
          <button
            type="button"
            className="member-login-logout"
            onClick={handleSignOut}
            disabled={loading}
          >
            {text.signOut}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="member-login-guest">
      {/* <AuthButtons locale={locale} /> */}
      <div className="subscribe-divider">{/* <span>{text.or}</span> */}</div>
      <MemberAuthForm
        locale={locale}
        onSignedIn={refreshUser}
        signUpHref={`/${locale}/sign-up`}
      />
    </div>
  );
};
