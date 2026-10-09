import { NextRequest, NextResponse } from "next/server";
import { callPublicApi } from "@/services/api/server";
import { rejectCrossSiteRequest, readJsonObject } from "@/services/api/request-security";
import { applySession } from "@/services/auth/session";
import type { AuthSuccess } from "@/modules/account/types";

export async function POST(request: NextRequest) {
  const rejected = rejectCrossSiteRequest(request);
  if (rejected) return rejected;
  const body = await readJsonObject(request);
  const idToken = typeof body?.idToken === "string" ? body.idToken : "";
  const phone = typeof body?.phone === "string" ? body.phone.trim() : "";
  const otp = typeof body?.otp === "string" ? body.otp.trim() : "";
  if (idToken.length > 12_000 || !/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(idToken) || !/^\+[1-9]\d{7,14}$/.test(phone) || !/^\d{4}$/.test(otp)) {
    return NextResponse.json({ message: "Enter the four-digit verification code." }, { status: 400 });
  }
  const upstream = await callPublicApi("/auth/login/google/phone/verify-otp", { idToken, phone, otp });
  if (!upstream.ok) return upstream;
  const data = (await upstream.json()) as AuthSuccess;
  if (!data.accessToken || !data.user) {
    return NextResponse.json({ message: "Phone verification could not complete sign-in." }, { status: 502 });
  }
  const response = NextResponse.json({ user: data.user });
  applySession(response, data);
  return response;
}
