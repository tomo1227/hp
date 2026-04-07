"use client";

import {
  fetchAuthSession,
  getCurrentUser,
  signInWithRedirect,
  signOut,
} from "aws-amplify/auth";
import { useEffect, useState } from "react";
import { configureAmplifyClient } from "@/components/features/amplifyProvider";

type Locale = "en" | "ja";

type AuthButtonsProps = {
  locale?: Locale;
};

const copy = {
  en: {
    title: "Sign in with",
    signOut: "Sign out",
    signedInAs: "Signed in as",
    providers: {
      google: "Google",
    },
  },
  ja: {
    title: "SNSでログイン",
    signOut: "ログアウト",
    signedInAs: "ログイン中",
    providers: {
      google: "Google",
    },
  },
};

export const AuthButtons = ({ locale = "en" }: AuthButtonsProps) => {
  const [user, setUser] = useState<{ username?: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const text = copy[locale] ?? copy.en;

  useEffect(() => {
    const load = async () => {
      try {
        configureAmplifyClient();
        await fetchAuthSession();
        const current = await getCurrentUser();
        setUser({ username: current.username });
      } catch {
        setUser(null);
      }
    };
    load();
  }, []);

  const handleSignIn = async () => {
    setLoading(true);
    try {
      configureAmplifyClient();
      await signInWithRedirect({
        provider: "Google",
        customState: locale,
      });
    } catch (err) {
      console.error("[Auth] signInWithRedirect error", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await signOut();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-block">
      <p className="auth-title">{text.title}</p>
      {user ? (
        <div className="auth-signed-in">
          <span>
            {text.signedInAs}: {user.username}
          </span>
          <button type="button" onClick={handleSignOut} disabled={loading}>
            {text.signOut}
          </button>
        </div>
      ) : (
        <div className="auth-grid">
          <button type="button" onClick={handleSignIn} disabled={loading}>
            {text.providers.google}
          </button>
        </div>
      )}
    </div>
  );
};
