import "server-only";

import { NextResponse } from "next/server";
import type { AuthSuccess, AuthUser, ImpersonationSession } from "@/modules/account/types";

const TOKEN_COOKIE = "shaaneiol_access_token";
const USER_COOKIE = "shaaneiol_user";

const MAX_SESSION_SECONDS = 60 * 60 * 24 * 30;

function tokenExpiry(token?: string): number | null {
  const encodedPayload = token?.split(".")[1];
  if (!encodedPayload) return null;
  try {
    const { exp } = JSON.parse(
      Buffer.from(encodedPayload, "base64url").toString("utf8"),
    ) as { exp?: unknown };
    return typeof exp === "number" ? exp : null;
  } catch {
    return null;
  }
}

// The cookies live exactly as long as the JWT they carry (capped at 30 days), so they
// never outlast the token. A token without a readable exp keeps the 30-day default.
function sessionMaxAge(token?: string) {
  const exp = tokenExpiry(token);
  if (exp === null) return MAX_SESSION_SECONDS;
  return Math.max(0, Math.min(MAX_SESSION_SECONDS, Math.floor(exp - Date.now() / 1000)));
}

function sessionCookieOptions(token?: string) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: sessionMaxAge(token),
  };
}

export function applySessionUser(response: NextResponse, user: AuthUser, token?: string) {
  response.cookies.set(
    USER_COOKIE,
    Buffer.from(JSON.stringify(user)).toString("base64url"),
    sessionCookieOptions(token),
  );
}

export function applySession(response: NextResponse, data: AuthSuccess) {
  const cookieOptions = sessionCookieOptions(data.accessToken);

  response.cookies.set(TOKEN_COOKIE, data.accessToken, cookieOptions);
  applySessionUser(response, data.user, data.accessToken);
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
