import { randomBytes } from "crypto";

export const createRandomString = () => {
  return String.fromCharCode(...randomBytes(32));
};

export const base64UrlStringEncode = (str: string) => {
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};
