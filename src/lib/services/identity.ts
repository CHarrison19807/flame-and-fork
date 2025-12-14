import { DecodedIdToken } from "@/models";
import {
  createProviderAccount,
  getProviderAccount,
  getProviderAccountsOfUser,
} from "../prisma/account";
import { createUser, getUserByEmail, getUserById } from "../prisma";
import { parseName } from "@/lib/utils/parse-name";
import { User } from "@prisma/client";

export const linkOidcToUser = async (
  decodedIdToken: DecodedIdToken,
): Promise<User> => {
  const {
    email,
    name,
    email_verified: emailVerified,
    given_name: givenName,
    family_name: familyName,
    sub,
    iss,
  } = decodedIdToken;

  if (!sub || !iss || !email) {
    throw new Error("Invalid ID token: missing required claims");
  }

  const existingProviderAccount = await getProviderAccount({
    provider: iss,
    providerAccountId: sub,
  });

  // Provider account found, return associated user
  if (existingProviderAccount) {
    const existingUser = await getUserById(existingProviderAccount.userId);

    if (!existingUser) {
      throw new Error("User linked to provider account not found.");
    }

    return existingUser;
  }

  // No provider account found
  if (emailVerified) {
    const exisitingUser = await getUserByEmail(email);

    if (exisitingUser) {
      const existingUserProviderAccounts = await getProviderAccountsOfUser(
        exisitingUser.id,
      );

      const alreadyLinked = existingUserProviderAccounts.some(
        (account) => account.provider === iss,
      );

      // Throw error, oidc provider has same email but different sub claim
      // same email and same sub would have been caught earlier
      if (alreadyLinked) {
        throw new Error(
          "An account with this email already exists linked to a different OIDC account.",
        );
      }
      // Link new OIDC account to existing user
      await createProviderAccount({
        provider: iss,
        providerAccountId: sub,
        user: {
          connect: {
            id: exisitingUser.id,
          },
        },
      });

      return exisitingUser;
    }

    // No existing user, create new user and link OIDC account
    const newUser = await createUser({
      email,
      name: parseName({ name, given_name: givenName, family_name: familyName }),
      accounts: {
        create: {
          provider: iss,
          providerAccountId: sub,
        },
      },
    });

    return newUser;
  }

  throw new Error("Email not verified by OIDC provider.");
};
