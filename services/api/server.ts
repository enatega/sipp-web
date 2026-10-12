import "server-only";

import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { clientIpFrom } from "@/services/api/client-ip";
import { requiredServerEnv } from "@/services/api/env";
import { authCookieNames } from "@/services/auth/session";

// Forwarded so upstream per-IP rate limits (OTP, throttler) apply per user, not to the BFF host.
export async function clientIpHeaders(): Promise<Record<string, string>> {
  try {
    const ip = clientIpFrom(await headers());
    return ip ? { "X-Forwarded-For": ip } : {};
  } catch {
    return {};
  }
}

function apiBaseUrl() {
  return requiredServerEnv("API_BASE_URL", "http://localhost:3000/api/v1").replace(/\/$/, "");
}

function errorMessage(payload: unknown, fallback: string) {
  if (!payload || typeof payload !== "object") return fallback;
  const candidate = payload as { message?: string | string[]; error?: string };
  if (Array.isArray(candidate.message)) return candidate.message[0] ?? fallback;
  return candidate.message ?? candidate.error ?? fallback;
}

function safeErrorPayload(payload: unknown, fallback: string) {
  const candidate =
    payload && typeof payload === "object"
      ? (payload as {
          message?: string | string[];
          error?: string;
          code?: string;
          status?: string;
          applicationId?: string;
          fields?: unknown;
        })
      : {};
  return {
    message: errorMessage(payload, fallback),
    ...(candidate.code ? { code: candidate.code } : {}),
    ...(candidate.status ? { status: candidate.status } : {}),
    ...(candidate.applicationId
      ? { applicationId: candidate.applicationId }
      : {}),
    ...(Array.isArray(candidate.fields)
      ? { fields: candidate.fields.filter((field) => field === "email" || field === "phone") }
      : {}),
  };
}

type CallOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  request?: NextRequest;
};

export async function callApi(path: string, options: CallOptions = {}) {
  const { method = "GET", body, request } = options;
  const token = request?.cookies.get(authCookieNames.token)?.value;

  try {
    const upstream = await fetch(`${apiBaseUrl()}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(await clientIpHeaders()),
        ...(request?.headers.get("x-timezone")
          ? { "x-timezone": request.headers.get("x-timezone")! }
          : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      cache: "no-store",
      signal: AbortSignal.timeout(20_000),
    });
    const data = await upstream.json().catch(() => null);

    if (!upstream.ok) {
      return NextResponse.json(
        { message: errorMessage(data, "We could not complete that request.") },
        { status: upstream.status },
      );
    }
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { message: "The SIPP service is unavailable right now." },
      { status: 503 },
    );
  }
}

export async function callPublicApi(path: string, payload: unknown) {
  try {
    const upstream = await fetch(`${apiBaseUrl()}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(await clientIpHeaders()) },
      body: JSON.stringify(payload),
      cache: "no-store",
      signal: AbortSignal.timeout(20_000),
    });
    const data = await upstream.json().catch(() => null);
    if (!upstream.ok) {
      return NextResponse.json(
        safeErrorPayload(data, "We could not complete that request. Please try again."),
        { status: upstream.status },
      );
    }
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { message: "The SIPP service is unavailable right now." },
      { status: 503 },
    );
  }
}

export async function getPublicApi(path: string) {
  try {
    const upstream = await fetch(`${apiBaseUrl()}${path}`, {
      headers: await clientIpHeaders(),
      cache: "no-store",
      signal: AbortSignal.timeout(20_000),
    });
    const data = await upstream.json().catch(() => null);
    if (!upstream.ok) {
      return NextResponse.json(
        safeErrorPayload(data, "We could not complete that request."),
        { status: upstream.status },
      );
    }
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { message: "The SIPP service is unavailable right now." },
      { status: 503 },
    );
  }
}

export async function callPublicMultipart(path: string, body: FormData) {
  try {
    const upstream = await fetch(`${apiBaseUrl()}${path}`, {
      method: "POST",
      headers: await clientIpHeaders(),
      body,
      cache: "no-store",
      signal: AbortSignal.timeout(60_000),
    });
    const data = await upstream.json().catch(() => null);
    if (!upstream.ok) {
      return NextResponse.json(
        safeErrorPayload(
          data,
          "We could not submit your application. Please try again.",
        ),
        { status: upstream.status },
      );
    }
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { message: "The SIPP service is unavailable right now." },
      { status: 503 },
    );
  }
}

export async function callAuthenticatedMultipart(
  path: string,
  body: FormData,
  request: NextRequest,
  method: "POST" | "PATCH" = "PATCH",
) {
  const token = request.cookies.get(authCookieNames.token)?.value;

  try {
    const upstream = await fetch(`${apiBaseUrl()}${path}`, {
      method,
      headers: {
        ...(await clientIpHeaders()),
        ...(request.headers.get("x-timezone")
          ? { "x-timezone": request.headers.get("x-timezone")! }
          : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body,
      cache: "no-store",
      signal: AbortSignal.timeout(60_000),
    });
    const data = await upstream.json().catch(() => null);
    if (!upstream.ok) {
      return NextResponse.json(
        safeErrorPayload(data, "We could not upload that file."),
        { status: upstream.status },
      );
    }
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { message: "The SIPP service is unavailable right now." },
      { status: 503 },
    );
  }
}

export function requireSession(request: NextRequest) {
  if (request.cookies.get(authCookieNames.token)?.value) return null;
  return NextResponse.json(
    { message: "Sign in to continue." },
    { status: 401 },
  );
}
