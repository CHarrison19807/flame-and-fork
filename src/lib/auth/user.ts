import { getUserById } from "../prisma";
import { User } from "@prisma/client";
import { getSessionCookie, parseSessionCookie } from "./cookies";
import { validateSessionCookie } from "@/lib/services";

export const getCurrentUser = async (): Promise<User | null> => {
  const sessionCookie = await getSessionCookie();
  const sessionId = parseSessionCookie(sessionCookie);
  const validatedSession = await validateSessionCookie(sessionId);

  if (!validatedSession) {
    return null;
  }

  return await getUserById(validatedSession.userId);
};
