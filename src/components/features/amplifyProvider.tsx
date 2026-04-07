"use client";

import { Amplify } from "aws-amplify";

let configured = false;

export const configureAmplifyClient = () => {
  if (configured) return;
  if (typeof window === "undefined") return;

  const baseUrl = window.location.origin;
  const oauthDomain = process.env.NEXT_PUBLIC_AMPLIFY_OAUTH_DOMAIN ?? "";

  const oauthConfig = oauthDomain
    ? {
        domain: oauthDomain,
        scopes: ["openid", "email", "profile"],
        redirectSignIn: [`${baseUrl}/auth/callback`],
        redirectSignOut: [`${baseUrl}/`],
        responseType: "code" as const,
      }
    : undefined;

  const cognitoConfig = {
    userPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID ?? "",
    userPoolClientId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_CLIENT_ID ?? "",
    loginWith: {
      email: true as const,
      oauth: oauthConfig,
    },
  };

  Amplify.configure(
    {
      Auth: {
        Cognito: cognitoConfig,
      },
    },
    { ssr: true },
  );

  configured = true;
};

// export const AmplifyProvider = ({
//   children,
// }: {
//   children: React.ReactNode;
// }) => {
//   useEffect(() => {
//     configureAmplifyClient();

//     // Google認証時のエラーやレスポンスを監視
//     const handler = (event: MessageEvent) => {
//       if (typeof event.data === "string" && event.data.includes("error")) {
//         console.error("[OAuth Error]", event.data);
//       } else {
//         console.log("[OAuth Message]", event.data);
//       }
//     };
//     window.addEventListener("message", handler);
//     return () => window.removeEventListener("message", handler);
//   }, []);

//   return children;
// };
export const AmplifyProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  configureAmplifyClient();
  return children;
};
