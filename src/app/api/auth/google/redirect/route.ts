import { NextResponse } from "next/server";
import {
  getOidcConfig,
  parseAuthorizeResponse,
  validateAuthorizeResponse,
  validateTokenResponse,
} from "@/lib/auth/oidc";
import { GOOGLE_ISSUER_URL } from "@/constants";
import { DecodedIdToken, OAuthTokenRequest, TokenResponse } from "@/models";
import {
  clearTokenParamsCookie,
  getTokenParamsCookie,
  parseTokenParamsCookie,
  storeSessionCookie,
} from "@/lib/auth/cookies";
import { createSession } from "@/lib/prisma";
import { validateSessionCookie, linkOidcToUser } from "@/lib/services";

// TODO refactor to handler
const GET = async (request: Request) => {
  const tokenParamsCookie = await getTokenParamsCookie();
  let oidcAuthParams;

  try {
    oidcAuthParams = parseTokenParamsCookie(tokenParamsCookie);
    await clearTokenParamsCookie();
  } catch (error) {
    console.error("Error validating token params cookie:", error);
  }

  if (!oidcAuthParams) {
    return NextResponse.redirect("http://localhost:3000/");
  }

  const requestUrl = new URL(request.url);
  const searchParams = requestUrl.searchParams;
  const authorizeResponse = parseAuthorizeResponse(searchParams);

  const code = validateAuthorizeResponse({
    authorizeResponse,
    expectedState: oidcAuthParams.state,
  });

  const oidcConfig = await getOidcConfig(GOOGLE_ISSUER_URL);
  const tokenRequestParams: OAuthTokenRequest = {
    grant_type: "authorization_code",
    code,
    redirect_uri: process.env.GOOGLE_REDIRECT_URL!,
    client_id: process.env.GOOGLE_CLIENT_ID!,
    client_secret: process.env.GOOGLE_CLIENT_SECRET!,
  };

  const requestSearchParams = new URLSearchParams({
    ...tokenRequestParams,
  });

  const tokenRequest: RequestInit = {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams(requestSearchParams),
  };

  const tokenResponse: TokenResponse = await (
    await fetch(oidcConfig.token_endpoint, tokenRequest)
  ).json();

  const { decodedIdToken } = await validateTokenResponse(
    tokenResponse,
    oidcAuthParams.nonce,
  );

  const user = await linkOidcToUser(decodedIdToken as DecodedIdToken);
  const session = await createSession(user.id);
  const savedSession = await storeSessionCookie(session);
  const validatedSession = await validateSessionCookie(session.id);

  console.log("Validated session:", validatedSession);
  console.log("User logged in via Google OIDC:", user);
  console.log("Saved session:", savedSession);
  console.log("Session created:", session);
  console.log("Redirecting to homepage...");
  return NextResponse.redirect("http://localhost:3000/");
};

export { GET };
