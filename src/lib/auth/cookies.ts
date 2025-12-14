import { OidcAuthenticationParams } from "@/models";
import { Session } from "@prisma/client";
import { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { cookies } from "next/headers";
import { TOKEN_PARAMS_STORAGE_KEY, SESSION_STORAGE_KEY } from "@/constants";

export const storeTokenParamsCookie = async (
  oidcAuthParams: OidcAuthenticationParams,
): Promise<void> => {
  (await cookies()).set(
    TOKEN_PARAMS_STORAGE_KEY,
    JSON.stringify(oidcAuthParams),
    {
      path: "/",
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 600,
    },
  );
};

export const getTokenParamsCookie = async (): Promise<
  RequestCookie | undefined
> => {
  return (await cookies()).get(TOKEN_PARAMS_STORAGE_KEY);
};

export const clearTokenParamsCookie = async (): Promise<void> => {
  (await cookies()).delete(TOKEN_PARAMS_STORAGE_KEY);
};

export const parseTokenParamsCookie = (
  tokenParamsCookie: RequestCookie | undefined,
): OidcAuthenticationParams => {
  if (!tokenParamsCookie) {
    throw new Error("Missing token params cookie");
  }

  const tokenParams = JSON.parse(
    tokenParamsCookie.value,
  ) as OidcAuthenticationParams;
  if (tokenParams.state === undefined || tokenParams.nonce === undefined) {
    throw new Error("Invalid token params cookie");
  }
  return tokenParams;
};

export const storeSessionCookie = async (session: Session): Promise<void> => {
  (await cookies()).set(SESSION_STORAGE_KEY, session.id, {
    path: "/",
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    expires: session.expiresAt,
  });
};

export const getSessionCookie = async (): Promise<
  RequestCookie | undefined
> => {
  return (await cookies()).get(SESSION_STORAGE_KEY);
};

export const clearSessionCookie = async (): Promise<void> => {
  (await cookies()).delete(SESSION_STORAGE_KEY);
};

export const parseSessionCookie = (
  sessionCookie: RequestCookie | undefined,
): string => {
  if (!sessionCookie) {
    throw new Error("Missing session cookie");
  }

  const sessionId = sessionCookie.value;
  if (!sessionId) {
    throw new Error("Invalid session cookie");
  }
  return sessionId;
};
