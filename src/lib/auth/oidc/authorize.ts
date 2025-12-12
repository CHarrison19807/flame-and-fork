import {
  OidcConfig,
  GenerateAuthorizationUrlParams,
  GenerateAuthorizationUrlResult,
  AuthorizeResponse,
  ValidateAuthorizeResponseParams,
} from "@/models";
import { base64UrlStringEncode, createRandomString } from "@/lib/utils/crypto";

export const generateAuthorizeUrl = async (
  oidcConfig: OidcConfig,
  urlOptions: GenerateAuthorizationUrlParams,
): Promise<GenerateAuthorizationUrlResult> => {
  const generatedUrl = new URL(oidcConfig.authorization_endpoint);
  const {
    clientId: client_id,
    scope,
    redirectUri: redirect_uri,
    responseType: response_type,
    prompt,
  } = urlOptions;
  const state = base64UrlStringEncode(createRandomString());
  const nonce = base64UrlStringEncode(createRandomString());

  generatedUrl.searchParams.append("client_id", client_id);
  generatedUrl.searchParams.append("scope", scope.join(" "));
  generatedUrl.searchParams.append("redirect_uri", redirect_uri);
  generatedUrl.searchParams.append("response_type", response_type);
  generatedUrl.searchParams.append("state", state);
  generatedUrl.searchParams.append("nonce", nonce);

  if (prompt) {
    generatedUrl.searchParams.append("prompt", prompt);
  }

  return { url: generatedUrl.toString(), state, nonce };
};

export const parseAuthorizeResponse = (
  urlSearchParams: URLSearchParams,
): AuthorizeResponse => {
  const code = urlSearchParams.get("code");
  const state = urlSearchParams.get("state");
  const error = urlSearchParams.get("error");
  const error_description = urlSearchParams.get("error_description");

  return { code, state, error, error_description };
};

export const validateAuthorizeResponse = ({
  authorizeResponse,
  expectedState,
}: ValidateAuthorizeResponseParams): string => {
  const { code, state, error, error_description } = authorizeResponse;

  if (error) {
    throw new Error(`OAuth Error: ${error}`, {
      cause: error_description || error,
    });
  }

  if (!code) {
    throw new Error("OAuth code in authorize response is missing");
  }

  if (!state) {
    throw new Error("OAuth state in authorize response is missing");
  }

  if (state !== expectedState) {
    throw new Error(
      "OAuth state in authorize response does not match expected state",
    );
  }

  return code;
};
