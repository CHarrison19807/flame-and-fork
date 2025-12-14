import bcrypt from "bcryptjs";

const SALT_ROUNDS = 12;

const MIN_LENGTH = 8;
const MAX_LENGTH = 128;

const hasUpper = /[A-Z]/;
const hasLower = /[a-z]/;
const hasDigit = /[0-9]/;
const hasSymbol = /[^A-Za-z0-9]/;
const hasWhitespace = /\s/;

export const hashPassword = (password: string): Promise<string> => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

export const validatePassword = (
  password: string,
  passwordHash: string,
): Promise<boolean> => {
  return bcrypt.compare(password, passwordHash);
};

export const assertPasswordPolicy = (password: string): void => {
  if (
    password.length < MIN_LENGTH ||
    password.length > MAX_LENGTH ||
    hasWhitespace.test(password) ||
    !hasUpper.test(password) ||
    !hasLower.test(password) ||
    !hasDigit.test(password) ||
    !hasSymbol.test(password)
  ) {
    throw new Error("Password is not acceptable.");
  }
};
