"use client";

import { useEffect } from "react";
import "aws-amplify/auth/enable-oauth-listener";
import { Amplify } from "aws-amplify";

let configured = false;

type Locale = "ja" | "en";

export const configureAmplifyClient = ({ locale }: { locale: Locale }) => {
  if (configured) return;
  if (typeof window === "undefined") return;

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || window.location.origin;

  const oauthDomain = process.env.NEXT_PUBLIC_AMPLIFY_OAUTH_DOMAIN;

  if (!oauthDomain) {
    throw new Error("NEXT_PUBLIC_AMPLIFY_OAUTH_DOMAIN is not set");
  }

  const oauthConfig = {
    domain: oauthDomain,
    scopes: ["openid", "email", "profile"],
    redirectSignIn: [`${baseUrl}/${locale}/auth/callback`],
    redirectSignOut: [`${baseUrl}/${locale}/blogs`],
    responseType: "code" as const,
  };

  const cognitoConfig = {
    userPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID || "",
    userPoolClientId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_CLIENT_ID || "",
    loginWith: {
      email: true as const,
      oauth: oauthConfig,
    },
  };

  Amplify.configure({
    Auth: {
      Cognito: cognitoConfig,
    },
  });

  configured = true;
};

export const AmplifyProvider = ({
  children,
  locale,
}: {
  children: React.ReactNode;
  locale: Locale;
}) => {
  useEffect(() => {
    configureAmplifyClient({ locale });
  }, [locale]);

  return <>{children}</>;
};
