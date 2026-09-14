import { NextRequest, NextResponse } from "next/server";
import { callApi, requireSession } from "@/services/api/server";
import { clearSession } from "@/services/auth/session";
import { isStrongPassword, isValidOtp, readJsonObject, rejectCrossSiteRequest, sessionEmail } from "@/services/api/request-security";

export async function POST(request: NextRequest) {
  const rejected = rejectCrossSiteRequest(request) ?? requireSession(request);
  if (rejected) return rejected;
  const email = sessionEmail(request);
  const body = await readJsonObject(request);
  if (!email || !isValidOtp(body?.otp) || !isStrongPassword(body?.newPassword)) {
    return NextResponse.json({ message: "Enter a valid code and a strong new password." }, { status: 400 });
  }
  const upstream = await callApi("/apps/deliveries/settings/change-password/update", {
    method: "POST",
    body: { email, otp: body.otp, newPassword: body.newPassword },
    request,
  });
  if (!upstream.ok) return upstream;
  const data = await upstream.json();
  const response = NextResponse.json(data);
  clearSession(response);
  return response;
}
