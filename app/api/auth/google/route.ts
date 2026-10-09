import { NextRequest, NextResponse } from "next/server";
import { callPublicApi } from "@/services/api/server";
import { rejectCrossSiteRequest, readJsonObject } from "@/services/api/request-security";
import { applySession } from "@/services/auth/session";
import type { AuthSuccess } from "@/modules/account/types";

function isIdentityToken(value: unknown): value is string {
  return typeof value === "string" && value.length <= 12_000 && /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(value);
}

export async function POST(request: NextRequest) {
  const rejected = rejectCrossSiteRequest(request);
  if (rejected) return rejected;

  const body = await readJsonObject(request);
  if (!isIdentityToken(body?.idToken)) {
    return NextResponse.json({ message: "Google sign-in response was invalid." }, { status: 400 });
  }

  const upstream = await callPublicApi("/auth/login/google", {
    idToken: body.idToken,
    user_type: "Customer",
    device_push_token: "",
  });
  if (!upstream.ok) return upstream;

  const data = (await upstream.json()) as AuthSuccess & { phoneVerificationRequired?: boolean };
  if (data.phoneVerificationRequired) {
    return NextResponse.json({ phoneVerificationRequired: true });
  }
  if (!data.accessToken || !data.user) {
    return NextResponse.json({ message: "Google sign-in could not be completed." }, { status: 502 });
  }
  const response = NextResponse.json({ user: data.user });
  applySession(response, data);
  return response;
}
