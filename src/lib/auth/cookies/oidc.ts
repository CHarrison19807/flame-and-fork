import { OIDC_AUTH_COOKIE_KEY } from "@/constants";
import { OidcAuthenticationParams } from "@/models";
import { cookies } from "next/headers";

export const saveTokenParams = async (
  oidcAuthParams: OidcAuthenticationParams,
): Promise<void> => {
  const cookieStore = await cookies();

  cookieStore.set(OIDC_AUTH_COOKIE_KEY, JSON.stringify(oidcAuthParams), {
    path: "/",
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 600,
  });
};

export const getTokenParams =
  async (): Promise<OidcAuthenticationParams | null> => {
    const cookieStore = await cookies();
    const oidcAuthCookie = cookieStore.get(OIDC_AUTH_COOKIE_KEY);

    if (
      !oidcAuthCookie ||
      JSON.parse(oidcAuthCookie.value).state === undefined ||
      JSON.parse(oidcAuthCookie.value).nonce === undefined
    ) {
      console.error("Missing or invalid OAuth session cookie");
      return null;
    }

    return JSON.parse(oidcAuthCookie.value);
  };
