import "server-only";

import { NextResponse } from "next/server";
import type { AuthSuccess, AuthUser, ImpersonationSession } from "@/modules/account/types";

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

export function decodeTokenImpersonation(
  token?: string,
): ImpersonationSession | null {
  const encodedPayload = token?.split(".")[1];
  if (!encodedPayload) return null;
  try {
    const parsed = JSON.parse(
      Buffer.from(encodedPayload, "base64url").toString("utf8"),
    ) as { impersonation?: Partial<ImpersonationSession> };
    const impersonation = parsed.impersonation;
    if (
      typeof impersonation?.adminId !== "string" ||
      typeof impersonation.targetUserId !== "string" ||
      typeof impersonation.startedAt !== "string"
    ) {
      return null;
    }
    return impersonation as ImpersonationSession;
  } catch {
    return null;
  }
}

export function decodeSessionUser(value?: string): AuthUser | null {
  if (!value) return null;
  try {
    return JSON.parse(Buffer.from(value, "base64url").toString("utf8"));
  } catch {
    return null;
  }
}

/**
 * True when the cookies describe a signed-in, unexpired session. Signature
 * checks stay with the API; this only decides page-level redirects.
 */
export function hasActiveSession(token?: string, userCookie?: string): boolean {
  if (!token || !decodeSessionUser(userCookie)) return false;
  const encodedPayload = token.split(".")[1];
  if (!encodedPayload) return false;
  try {
    const { exp } = JSON.parse(
      Buffer.from(encodedPayload, "base64url").toString("utf8"),
    ) as { exp?: number };
    return typeof exp !== "number" || exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

export const authCookieNames = {
  token: TOKEN_COOKIE,
  user: USER_COOKIE,
};
