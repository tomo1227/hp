import { createRemoteJWKSet, jwtVerify } from "jose";

const userPoolId = process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID ?? "";
const region = process.env.NEXT_PUBLIC_AWS_REGION ?? "";

type CognitoClaims = {
  email?: string;
  iss?: string;
  exp?: number;
};

const getIssuer = () => {
  return `https://cognito-idp.${region}.amazonaws.com/${userPoolId}`;
};

export const verifyCognitoToken = async (token: string) => {
  const issuer = getIssuer();
  const jwks = createRemoteJWKSet(new URL(`${issuer}/.well-known/jwks.json`));

  const { payload } = await jwtVerify<CognitoClaims>(token, jwks, {
    issuer,
  });

  return payload;
};
