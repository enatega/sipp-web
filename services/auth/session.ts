import "server-only";

import { NextResponse } from "next/server";
import type { AuthSuccess, AuthUser } from "@/modules/account/types";

const TOKEN_COOKIE = "shaaneiol_access_token";
const USER_COOKIE = "shaaneiol_user";

function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  };
}

export function applySessionUser(response: NextResponse, user: AuthUser) {
  response.cookies.set(
    USER_COOKIE,
    Buffer.from(JSON.stringify(user)).toString("base64url"),
    sessionCookieOptions(),
  );
}

export function applySession(response: NextResponse, data: AuthSuccess) {
  const cookieOptions = sessionCookieOptions();

  response.cookies.set(TOKEN_COOKIE, data.accessToken, cookieOptions);
  applySessionUser(response, data.user);
}

export function clearSession(response: NextResponse) {
  response.cookies.set(TOKEN_COOKIE, "", { path: "/", maxAge: 0 });
  response.cookies.set(USER_COOKIE, "", { path: "/", maxAge: 0 });
}

export function decodeSessionUser(value?: string): AuthUser | null {
  if (!value) return null;
  try {
    return JSON.parse(Buffer.from(value, "base64url").toString("utf8"));
  } catch {
    return null;
  }
}

export const authCookieNames = {
  token: TOKEN_COOKIE,
  user: USER_COOKIE,
};
