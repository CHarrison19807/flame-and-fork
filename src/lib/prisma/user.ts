import { Prisma, Role } from "@prisma/client";
import { prisma } from "./prisma";

export const createUser = async (user: Prisma.UserCreateInput) => {
  return prisma.user.create({
    data: {
      ...user,
    },
  });
};

export const deleteUserById = async (userId: string) => {
  return prisma.user.delete({
    where: {
      id: userId,
    },
  });
};

export const getUserById = async (userId: string) => {
  return prisma.user.findUnique({
    where: {
      id: userId,
    },
  });
};

export const getUserByEmail = async (email: string) => {
  return prisma.user.findUnique({
    where: {
      email,
    },
  });
};

export const updateUserById = async (
  userId: string,
  data: Partial<Prisma.UserUpdateInput>,
) => {
  return prisma.user.update({
    where: {
      id: userId,
    },
    data,
  });
};

export const getAllUsers = async () => {
  return prisma.user.findMany();
};

export const getUsersByRole = async (role: Role) => {
  return prisma.user.findMany({
    where: {
      role,
    },
  });
};

export const countUsers = async () => {
  return prisma.user.count();
};

export const countUsersByRole = async (role: Role) => {
  return prisma.user.count({
    where: {
      role,
    },
  });
};
