import { NextRequest, NextResponse } from "next/server";
import { callPublicApi } from "@/services/api/server";
import { rejectCrossSiteRequest, readJsonObject } from "@/services/api/request-security";
import { applySession } from "@/services/auth/session";
import type { AuthSuccess } from "@/modules/account/types";

function isExchangeToken(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length >= 20 &&
    value.length <= 4096 &&
    /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(value)
  );
}

export async function POST(request: NextRequest) {
  const rejected = rejectCrossSiteRequest(request);
  if (rejected) return rejected;

  const body = await readJsonObject(request);
  if (!isExchangeToken(body?.token)) {
    return NextResponse.json(
      { message: "The impersonation link is invalid." },
      { status: 400 },
    );
  }

  const upstream = await callPublicApi("/auth/impersonation/exchange", {
    token: body.token,
  });
  if (!upstream.ok) return upstream;

  const data = (await upstream.json()) as AuthSuccess;
  const response = NextResponse.json({ user: data.user });
  applySession(response, data);
  return response;
}
