"use client";

import { getCurrentUser, signOut } from "aws-amplify/auth";
import { Hub } from "aws-amplify/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { configureAmplifyClient } from "@/components/features/amplifyProvider";

type SidebarMemberActionsProps = {
  locale: "ja" | "en";
};

type UserState = {
  username?: string;
} | null;

const SidebarMemberActions = ({ locale }: SidebarMemberActionsProps) => {
  const pathname = usePathname();
  const [user, setUser] = useState<UserState>(null);
  const [loading, setLoading] = useState(false);
  const [checked, setChecked] = useState(false);
  const isSubscribePath = pathname.startsWith(`/${locale}/membership`);
  const isPortalPath = pathname.startsWith(`/${locale}/member/portal`);

  const refreshUser = useCallback(async () => {
    try {
      const current = await getCurrentUser();
      setUser({ username: current.username });
    } catch {
      setUser(null);
    } finally {
      setChecked(true);
    }
  }, []);

  useEffect(() => {
    configureAmplifyClient({ locale });
    refreshUser();
    const unsub = Hub.listen("auth", ({ payload }) => {
      if (payload.event === "signedIn" || payload.event === "signedOut") {
        refreshUser();
      }
    });
    return () => {
      unsub();
    };
  }, [refreshUser, locale]);

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

  return (
    <>
      {!isSubscribePath && (
        <li>
          <Link className="sidebar-link" href={`/${locale}/membership`}>
            {locale === "ja" ? "メンバーシップ" : "Membership"}
          </Link>
        </li>
      )}
      {!checked ? (
        <li>
          <button type="button" className="sidebar-button" disabled>
            ...
          </button>
        </li>
      ) : user ? (
        <>
          {!isPortalPath && (
            <li>
              <Link className="sidebar-link" href={`/${locale}/member/portal`}>
                {locale === "ja" ? "会員情報" : "Member Portal"}
              </Link>
            </li>
          )}
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
      ) : (
        <li>
          <Link className="sidebar-link" href={`/${locale}/login`}>
            {locale === "ja" ? "ログイン" : "Sign in"}
          </Link>
        </li>
      )}
    </>
  );
};

export default SidebarMemberActions;
