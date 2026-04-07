/// <reference types="node" />

import { defineAuth, secret } from "@aws-amplify/backend";

type BackendSecret = ReturnType<typeof secret>;

type ExternalProviderOptions = {
  google?: { clientId: BackendSecret; clientSecret: BackendSecret };
  signInWithApple?: {
    clientId: BackendSecret;
    teamId: BackendSecret;
    keyId: BackendSecret;
    privateKey: BackendSecret;
  };
  oidc?: {
    name: string;
    issuerUrl: string;
    clientId: BackendSecret;
    clientSecret: BackendSecret;
  }[];
  callbackUrls: string[];
  logoutUrls: string[];
  domainPrefix?: string;
};

/**
 * Define and configure your auth resource
 * @see https://docs.amplify.aws/gen2/build-a-backend/auth
 */
const externalProviders: ExternalProviderOptions = {
  google: {
    clientId: secret("AMPLIFY_GOOGLE_CLIENT_ID"),
    clientSecret: secret("AMPLIFY_GOOGLE_CLIENT_SECRET"),
  },
  signInWithApple: {
    clientId: secret("AMPLIFY_APPLE_CLIENT_ID"),
    teamId: secret("AMPLIFY_APPLE_TEAM_ID"),
    keyId: secret("AMPLIFY_APPLE_KEY_ID"),
    privateKey: secret("AMPLIFY_APPLE_PRIVATE_KEY"),
  },
  oidc: [
    {
      name: "LINE",
      issuerUrl: process.env.AMPLIFY_LINE_ISSUER_URL ?? "",
      clientId: secret("AMPLIFY_LINE_CLIENT_ID"),
      clientSecret: secret("AMPLIFY_LINE_CLIENT_SECRET"),
    },
    {
      name: "X",
      issuerUrl: process.env.AMPLIFY_X_ISSUER_URL ?? "",
      clientId: secret("AMPLIFY_X_CLIENT_ID"),
      clientSecret: secret("AMPLIFY_X_CLIENT_SECRET"),
    },
  ],
  callbackUrls: [
    "https://tomokiota.com/auth/callback",
    "http://127.0.0.1:3033/auth/callback",
  ],
  logoutUrls: [
    "https://tomokiota.com/",
    "http://127.0.0.1:3000/",
    "http://127.0.0.1:3033/",
  ],
  domainPrefix: process.env.AMPLIFY_COGNITO_DOMAIN_PREFIX ?? undefined,
};

export const auth = defineAuth({
  loginWith: {
    email: true,
    externalProviders,
  },
});
