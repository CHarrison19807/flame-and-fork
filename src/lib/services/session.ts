import { getSessionById, extendSessionIdleExpiry } from "@/lib/prisma";

export const validateSessionCookie = async (sessionId: string) => {
  if (!sessionId || sessionId.length === 0) {
    throw new Error("Invalid session ID");
  }

  const session = await getSessionById(sessionId);

  if (!session) {
    throw new Error("Session not found");
  }

  const { expiresAt, idleExpiresAt } = session;
  const now = new Date();

  if (expiresAt < now || idleExpiresAt < now) {
    return null;
  }

  return await extendSessionIdleExpiry(sessionId);
};
