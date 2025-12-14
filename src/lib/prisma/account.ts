import { Prisma } from "@prisma/client";
import { prisma } from "./prisma";

export interface getProviderAccountParams {
  provider: string;
  providerAccountId: string;
}

export const getProviderAccount = async (
  providerAccount: getProviderAccountParams,
) => {
  const { provider, providerAccountId } = providerAccount;
  return prisma.account.findUnique({
    where: {
      provider_providerAccountId: {
        provider: provider,
        providerAccountId: providerAccountId,
      },
    },
  });
};

export const getProviderAccountsOfUser = async (userId: string) => {
  return prisma.account.findMany({
    where: {
      userId,
    },
  });
};

export const createProviderAccount = async (
  account: Prisma.AccountCreateInput,
) => {
  return prisma.account.create({
    data: {
      ...account,
    },
  });
};
