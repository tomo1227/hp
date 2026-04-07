"use client";

import { Amplify } from "aws-amplify";

const userPoolId = process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID ?? "";
const userPoolClientId =
  process.env.NEXT_PUBLIC_COGNITO_USER_POOL_CLIENT_ID ?? "";
const identityPoolId = process.env.NEXT_PUBLIC_COGNITO_IDENTITY_POOL_ID ?? "";

let configured = false;

const getBaseUrl = () => {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return process.env.NEXT_PUBLIC_BASE_URL ?? "http://127.0.0.1:3000";
};

const configureAmplify = () => {
  if (configured) return;

  const baseUrl = getBaseUrl();
  const oauthDomain = process.env.NEXT_PUBLIC_AMPLIFY_OAUTH_DOMAIN ?? "";
  Amplify.configure(
    {
      Auth: {
        Cognito: {
          userPoolId,
          userPoolClientId,
          identityPoolId: identityPoolId || undefined,
          loginWith: {
            email: true,
            oauth: oauthDomain
              ? {
                  domain: oauthDomain,
                  scopes: ["openid", "email", "profile"],
                  redirectSignIn: [
                    `${baseUrl}/auth/callback`,
                    "https://tomokiota.com/auth/callback",
                    "http://127.0.0.1:3033/auth/callback",
                  ],
                  redirectSignOut: [
                    `${baseUrl}/`,
                    "https://tomokiota.com/",
                    "http://127.0.0.1:3033/",
                  ],
                  responseType: "code",
                }
              : undefined,
          },
        },
      },
    },
    { ssr: true },
  );

  configured = true;
};

export const AmplifyProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  configureAmplify();
  return children;
};
