import { NextRequest, NextResponse } from "next/server";
import { callPublicApi } from "@/services/api/server";
import { applyPasswordResetGrant } from "@/services/auth/password-reset";
import { isValidEmail, isValidOtp, readJsonObject, rejectCrossSiteRequest } from "@/services/api/request-security";

export async function POST(request: NextRequest) {
  const rejected = rejectCrossSiteRequest(request);
  if (rejected) return rejected;
  const body = await readJsonObject(request);
  if (!isValidEmail(body?.email) || !isValidOtp(body?.otp)) {
    return NextResponse.json({ message: "Enter a valid email and 4-digit code." }, { status: 400 });
  }
  const upstream = await callPublicApi("/otp/verify", {
    email: body.email.trim().toLowerCase(),
    otp: body.otp,
    otp_type: "email",
  });
  if (!upstream.ok) return upstream;
  const data = (await upstream.json()) as { message?: string; userId?: string };
  if (!data.userId) {
    return NextResponse.json({ message: "The verification could not be completed." }, { status: 502 });
  }
  try {
    const response = NextResponse.json({ message: data.message ?? "Code verified." });
    applyPasswordResetGrant(response, data.userId);
    return response;
  } catch {
    return NextResponse.json({ message: "Password reset is not configured." }, { status: 503 });
  }
}
