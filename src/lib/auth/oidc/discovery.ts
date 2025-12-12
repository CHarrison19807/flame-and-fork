import { OidcConfig } from "@/models";

const oidcCache = new Map<string, OidcConfig>();
const pending = new Map<string, Promise<OidcConfig>>();

export async function getOidcConfig(issuer: string): Promise<OidcConfig> {
  // already cached
  if (oidcCache.has(issuer)) {
    return oidcCache.get(issuer)!;
  }

  // fetch already in progress
  if (pending.has(issuer)) {
    return pending.get(issuer)!;
  }

  // start a fetch
  const promise = fetchOpenidConfiguration(issuer)
    .then((config) => {
      oidcCache.set(issuer, config);
      pending.delete(issuer);
      return config;
    })
    .catch((err) => {
      pending.delete(issuer);
      throw err;
    });

  pending.set(issuer, promise);
  return promise;
}

export const fetchOpenidConfiguration = async (
  issuerUrl: string,
): Promise<OidcConfig> => {
  const wellKnownUrl = `${issuerUrl}/.well-known/openid-configuration`;

  const response = await fetch(wellKnownUrl);

  return await response.json();
};
