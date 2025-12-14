import { NextResponse } from "next/server";
import { GOOGLE_ISSUER_URL } from "@/constants";
import { generateAuthorizeUrl, getOidcConfig } from "@/lib/auth/oidc";
import { storeTokenParamsCookie } from "@/lib/auth/cookies";

const GET = async () => {
  const oidcConfig = await getOidcConfig(GOOGLE_ISSUER_URL);
  const { url, state, nonce } = await generateAuthorizeUrl(oidcConfig, {
    clientId: process.env.GOOGLE_CLIENT_ID!,
    redirectUri: process.env.GOOGLE_REDIRECT_URL!,
    responseType: "code",
    scope: ["openid", "profile", "email"],
    prompt: "consent",
  });

  await storeTokenParamsCookie({ state, nonce });

  return NextResponse.redirect(url);
};

export { GET };
