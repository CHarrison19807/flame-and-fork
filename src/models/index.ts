import { JWTPayload } from "jose";

/*
 * The search params returned from an OAuth2 authorization endpoint.
 */
export interface AuthorizeResponse {
  state: string | null;
  code: string | null;
  error: string | null;
  error_description: string | null;
}

/*
 * The OpenID Connect configuration fetched from the issuer's well-known endpoint.
 * Only includes fields relevant to this application.
 */
export interface OidcConfig {
  issuer: string;
  authorization_endpoint: string;
  token_endpoint: string;
  acr_values_supported?: string[];
  id_token_signing_alg_values_supported: string[];
}

/*
 * Parameters for generating an OAuth2 authorization URL.
 */
export interface GenerateAuthorizationUrlParams {
  clientId: string;
  scope: string[];
  redirectUri: string;
  responseType: string;
  prompt?: string;
}

/*
 * The result of generating an OAuth2 authorization URL.
 */
export interface GenerateAuthorizationUrlResult {
  url: string;
  state: string;
  nonce: string;
}

export interface OAuthTokenRequest {
  grant_type: "authorization_code";
  code: string;
  redirect_uri: string;
  client_id: string;
  client_secret: string;
}

export interface TokenResponse {
  access_token: string;
  id_token?: string | JWTPayload;
  token_type: string;
  expires_in: string;
}

export interface OidcAuthenticationParams {
  state: string;
  nonce: string;
}

export interface ValidateAuthorizeResponseParams {
  authorizeResponse: AuthorizeResponse;
  expectedState: string;
}

export interface DecodedIdToken extends JWTPayload {
  email: string;
  name: string;
  email_verified?: boolean;
  given_name?: string;
  family_name?: string;
}
