import { cookies } from "next/headers";
import { REFRESH_TOKEN_TTL_SECONDS } from "./jwt";

export const REFRESH_COOKIE_NAME = "dsa_refresh_token";

export function setRefreshCookie(token: string) {
  cookies().set(REFRESH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: REFRESH_TOKEN_TTL_SECONDS,
  });
}

export function clearRefreshCookie() {
  cookies().set(REFRESH_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export function getRefreshCookie(): string | undefined {
  return cookies().get(REFRESH_COOKIE_NAME)?.value;
}
