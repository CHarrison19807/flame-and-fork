import { NextResponse } from "next/server";
import {
  getOidcConfig,
  parseAuthorizeResponse,
  validateAuthorizeResponse,
  validateTokenResponse,
} from "@/lib/auth/oidc";
import { GOOGLE_ISSUER_URL } from "@/constants";
import { OAuthTokenRequest, TokenResponse } from "@/models";
import { getTokenParams } from "@/lib/auth/cookies";

// TODO refactor to handler
const GET = async (request: Request) => {
  const oidcAuthParams = await getTokenParams();
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
  const done = await validateTokenResponse(
    tokenResponse,
    oidcAuthParams.nonce,
  );

  console.log("done", done);

  return NextResponse.redirect("http://localhost:3000/");
};

export { GET };
