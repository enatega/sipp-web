import "server-only";

import { NextRequest, NextResponse } from "next/server";
import { authCookieNames, decodeSessionUser } from "@/services/auth/session";

export function rejectCrossSiteRequest(request: NextRequest) {
  const origin = request.headers.get("origin");
  const fetchSite = request.headers.get("sec-fetch-site");
  if (
    (origin && origin !== request.nextUrl.origin) ||
    fetchSite === "cross-site"
  ) {
    return NextResponse.json({ message: "Request origin was not accepted." }, { status: 403 });
  }
  return null;
}

export async function readJsonObject(request: Request) {
  try {
    const body = await request.json();
    return body && typeof body === "object" && !Array.isArray(body)
      ? (body as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}

export function sessionEmail(request: NextRequest) {
  const user = decodeSessionUser(request.cookies.get(authCookieNames.user)?.value);
  return typeof user?.email === "string" ? user.email.trim().toLowerCase() : null;
}

export function isValidEmail(value: unknown): value is string {
  return typeof value === "string" && value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function isValidOtp(value: unknown): value is string {
  return typeof value === "string" && /^\d{4}$/.test(value);
}

export function isStrongPassword(value: unknown): value is string {
  return typeof value === "string" &&
    value.length >= 8 && value.length <= 128 &&
    /[a-z]/.test(value) && /[A-Z]/.test(value) && /\d/.test(value) && /[^A-Za-z0-9]/.test(value);
}
