import { NextResponse } from "next/server";
import { isValidOtp, readJsonObject } from "@/services/api/request-security";
import { callPublicApi } from "@/services/api/server";
import { applySession } from "@/services/auth/session";
import type { AuthSuccess } from "@/modules/account/types";

export async function POST(request: Request) {
  const body = await readJsonObject(request);
  const { phone, otp } = body ?? {};
  if (typeof phone !== "string" || !phone.trim() || phone.length > 32 || !isValidOtp(otp)) {
    return NextResponse.json({ message: "Enter a valid phone number and code." }, { status: 400 });
  }
  const upstream = await callPublicApi("/auth/shared/login/phone/verify-otp", {
    phone,
    otp,
    app_type: "customer",
  });

  if (!upstream.ok) return upstream;

  const data = (await upstream.json()) as AuthSuccess;
  const response = NextResponse.json({ user: data.user });
  applySession(response, data);
  return response;
}
