"use client";

import { getCurrentUser, signOut } from "aws-amplify/auth";
import Link from "next/link";
import { useEffect, useState } from "react";

type SidebarMemberActionsProps = {
  locale: "ja" | "en";
};

type UserState = {
  username?: string;
} | null;

const SidebarMemberActions = ({ locale }: SidebarMemberActionsProps) => {
  const [user, setUser] = useState<UserState>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const current = await getCurrentUser();
        setUser({ username: current.username });
      } catch {
        setUser(null);
      }
    };
    load();
  }, []);

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await signOut();
      setUser(null);
      window.location.reload();
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <>
      <li>
        <Link className="sidebar-link" href={`/${locale}/member/portal`}>
          {locale === "ja" ? "ポータル" : "Portal"}
        </Link>
      </li>
      <li>
        <button
          type="button"
          className="sidebar-button"
          onClick={handleSignOut}
          disabled={loading}
        >
          {loading ? "..." : locale === "ja" ? "ログアウト" : "Logout"}
        </button>
      </li>
    </>
  );
};

export default SidebarMemberActions;
