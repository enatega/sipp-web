import "server-only";

import { NextRequest, NextResponse } from "next/server";
import { isCrossSiteRequest } from "@/services/api/origin-check";
import { authCookieNames, decodeSessionUser } from "@/services/auth/session";

export function rejectCrossSiteRequest(request: NextRequest) {
  if (isCrossSiteRequest(request)) {
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

export function isUuid(value: unknown): value is string {
  return typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

export function invalidIdentifier() {
  return NextResponse.json({ message: "Invalid order identifier." }, { status: 400 });
}

function pageNumber(value: string | null, fallback: number, minimum: number, maximum: number) {
  if (value === null) return fallback;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= minimum && parsed <= maximum ? parsed : fallback;
}

// Forward only clamped offset/limit upstream; any other query parameter is dropped.
export function paginationQuery(searchParams: URLSearchParams, defaultLimit = 10, maxLimit = 50) {
  return new URLSearchParams({
    offset: String(pageNumber(searchParams.get("offset"), 0, 0, 100_000)),
    limit: String(pageNumber(searchParams.get("limit"), defaultLimit, 1, maxLimit)),
  });
}

export function isValidOtp(value: unknown): value is string {
  return typeof value === "string" && /^\d{4}$/.test(value);
}

export function isStrongPassword(value: unknown): value is string {
  return typeof value === "string" &&
    value.length >= 8 && value.length <= 128 &&
    /[a-z]/.test(value) && /[A-Z]/.test(value) && /\d/.test(value) && /[^A-Za-z0-9]/.test(value);
}
