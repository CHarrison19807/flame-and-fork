import { decodeJwt, decodeProtectedHeader, type JWTPayload } from "jose";

export interface ValidateIdTokenParams {
  idToken?: string | JWTPayload;
  issuer: string;
  clientId: string;
  nonce: string;
  idTokenSigningAlgValuesSupported: string[];
  acrValuesSupported?: string[];
}

export interface ValidateIdTokenResponse {
  encodedIdToken: string;
  decodedIdToken: JWTPayload;
}

export const validateIdToken = ({
  idToken,
  issuer,
  clientId,
  nonce,
  idTokenSigningAlgValuesSupported,
  acrValuesSupported,
}: ValidateIdTokenParams): ValidateIdTokenResponse => {
  if (!idToken) {
    throw new Error("No ID token supplied");
  }

  // Store the stringified token for simpler type-ing later on
  let encodedIdToken: string;
  let decodedIdToken: JWTPayload;
  let alg: string | undefined;

  try {
    if (typeof idToken !== "string") {
      // If the token is not a jwt string, use it directly as an unsigned object
      encodedIdToken = JSON.stringify(idToken);
      decodedIdToken = idToken;
      alg = "none";
    } else {
      // Otherwise, we have a signed jwt string to decode
      encodedIdToken = idToken;
      decodedIdToken = decodeJwt(idToken);
      alg = decodeProtectedHeader(idToken).alg;
    }
  } catch {
    throw new Error(
      "ID token format is neither a valid JSON object nor a signed JWT",
    );
  }

  // Verify required claims are present

  if (!decodedIdToken.sub) {
    throw new Error("Subject (sub) claim is missing from ID token");
  }

  if (!decodedIdToken.iat) {
    throw new Error("Issued At (iat) claim is missing from ID token");
  }

  if (!decodedIdToken.iss) {
    throw new Error("Issuer (iss) claim is missing from ID token");
  }

  if (!decodedIdToken.aud) {
    throw new Error("Audience (aud) claim is missing from ID token");
  }

  if (!decodedIdToken.exp) {
    throw new Error("Expiration Time (exp) claim is missing from the ID token");
  }

  if (!decodedIdToken.nonce) {
    throw new Error("Nonce (nonce) claim is missing from ID token");
  }

  if (!alg) {
    throw new Error("Algorithm (alg) claim is missing from ID token");
  }

  // Validate ID token claims

  if (decodedIdToken.iss !== issuer) {
    throw new Error(
      `Issuer (iss) claim ${decodedIdToken.iss} in the ID token does not match expected issuer claim: ${issuer}`,
    );
  }

  if (
    typeof decodedIdToken.aud === "string" &&
    decodedIdToken.aud !== clientId
  ) {
    throw new Error(
      `Audience (aud) claim ${decodedIdToken.aud} in the ID token does not match expected audience claim: ${clientId}`,
    );
  }

  if (Array.isArray(decodedIdToken.aud)) {
    if (!decodedIdToken.aud.includes(clientId)) {
      throw new Error(
        `Audience (aud) claim array ${decodedIdToken.aud} in the ID token does not include expected audience claim: ${clientId}`,
      );
    }

    if (decodedIdToken.aud.length > 1) {
      const azp = decodedIdToken.azp;
      if (!azp) {
        throw new Error(
          "Authorized Party (azp) claim is missing from ID token and must be present when there are multiple audiences",
        );
      }

      if (azp !== clientId) {
        throw new Error(
          `Authorized Party (azp) claim ${azp} in the ID token does not match expected authorized party claim: ${clientId}`,
        );
      }
    }
  }

  if (!idTokenSigningAlgValuesSupported.includes(alg)) {
    throw new Error(
      `Algorithm (alg) claim ${alg} in the ID token ${alg} is not one of the supported algorithms, supported algorithms: ${idTokenSigningAlgValuesSupported}`,
    );
  }

  if (decodedIdToken.nonce !== nonce) {
    throw new Error(
      `Nonce (nonce) claim ${decodedIdToken.nonce} in the ID token does not match expected ${nonce}`,
    );
  }

  if (
    decodedIdToken.acr &&
    !acrValuesSupported?.includes(decodedIdToken.acr as string)
  ) {
    throw new Error(
      `Authentication Context Class Reference (acr) claim ${decodedIdToken.acr} is not one of the supported acr values, supported acr values: ${acrValuesSupported}`,
    );
  }

  // Validate token timing claims

  // Default 15s leeway to account for clock skew issues with nbf and exp claims
  const leeway = 15;

  const now = new Date();
  const expDate = new Date((decodedIdToken.exp + leeway) * 1000);

  if (now > expDate) {
    throw new Error(
      `Expiration Time (exp) claim ${decodedIdToken.exp} indicates that this token is now expired at ${now}`,
    );
  }

  if (decodedIdToken.nbf) {
    const nbfDate = new Date((decodedIdToken.nbf - leeway) * 1000);
    if (now < nbfDate) {
      throw new Error(
        `Not Before (nbf) claim ${decodedIdToken.nbf} indicates that this token is not to be used yet at ${now}`,
      );
    }
  }

  return { encodedIdToken, decodedIdToken };
};
