"use client";

import { getCurrentUser, signOut } from "aws-amplify/auth";
import { useEffect, useState } from "react";

type Locale = "en" | "ja";

type MemberStatusProps = {
  locale?: Locale;
};

const copy = {
  en: {
    signedInAs: "Signed in as",
    signOut: "Sign out",
    signedOut: "Not signed in",
  },
  ja: {
    signedInAs: "ログイン中",
    signOut: "ログアウト",
    signedOut: "未ログイン",
  },
};

export const MemberStatus = ({ locale = "en" }: MemberStatusProps) => {
  const [username, setUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const text = copy[locale] ?? copy.en;

  useEffect(() => {
    const load = async () => {
      try {
        const current = await getCurrentUser();
        setUsername(current.username ?? null);
      } catch {
        setUsername(null);
      }
    };
    load();
  }, []);

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await signOut();
      setUsername(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="member-status">
      {username ? (
        <>
          <span>
            {text.signedInAs}: {username}
          </span>
          <button type="button" onClick={handleSignOut} disabled={loading}>
            {text.signOut}
          </button>
        </>
      ) : (
        <span>{text.signedOut}</span>
      )}
    </div>
  );
};
