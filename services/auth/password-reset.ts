import "server-only";

import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import type { NextRequest, NextResponse } from "next/server";

const RESET_COOKIE = "shaaneiol_password_reset";
const RESET_TTL_SECONDS = 10 * 60;
const developmentSecretKey = Symbol.for("shaaneiol.password-reset-secret");

function signingSecret() {
  const configured = process.env.SHAANIEOL_PASSWORD_RESET_SECRET;
  if (configured && configured.length >= 32) return configured;

  if (process.env.NODE_ENV === "production") {
    throw new Error("SHAANIEOL_PASSWORD_RESET_SECRET must contain at least 32 characters.");
  }

  const shared = globalThis as typeof globalThis & { [developmentSecretKey]?: string };
  shared[developmentSecretKey] ??= randomBytes(32).toString("base64url");
  return shared[developmentSecretKey];
}

function signature(value: string) {
  return createHmac("sha256", signingSecret()).update(value).digest("base64url");
}

export function applyPasswordResetGrant(response: NextResponse, userId: string) {
  const expiresAt = Math.floor(Date.now() / 1000) + RESET_TTL_SECONDS;
  const payload = Buffer.from(JSON.stringify({ userId, expiresAt })).toString("base64url");
  response.cookies.set(RESET_COOKIE, `${payload}.${signature(payload)}`, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/api/auth/forgot-password",
    maxAge: RESET_TTL_SECONDS,
  });
}

export function readPasswordResetGrant(request: NextRequest) {
  const value = request.cookies.get(RESET_COOKIE)?.value;
  if (!value) return null;

  const separator = value.lastIndexOf(".");
  if (separator < 1) return null;
  const payload = value.slice(0, separator);
  const supplied = Buffer.from(value.slice(separator + 1), "base64url");
  const expected = Buffer.from(signature(payload), "base64url");
  if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) return null;

  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as {
      userId?: unknown;
      expiresAt?: unknown;
    };
    if (
      typeof parsed.userId !== "string" ||
      typeof parsed.expiresAt !== "number" ||
      parsed.expiresAt <= Math.floor(Date.now() / 1000)
    ) return null;
    return parsed.userId;
  } catch {
    return null;
  }
}

export function clearPasswordResetGrant(response: NextResponse) {
  response.cookies.set(RESET_COOKIE, "", {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/api/auth/forgot-password",
    maxAge: 0,
  });
}
