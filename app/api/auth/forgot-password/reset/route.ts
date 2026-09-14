import { NextRequest, NextResponse } from "next/server";
import { callPublicApi } from "@/services/api/server";
import { clearPasswordResetGrant, readPasswordResetGrant } from "@/services/auth/password-reset";
import { isStrongPassword, readJsonObject, rejectCrossSiteRequest } from "@/services/api/request-security";

export async function POST(request: NextRequest) {
  const rejected = rejectCrossSiteRequest(request);
  if (rejected) return rejected;
  let userId: string | null = null;
  try {
    userId = readPasswordResetGrant(request);
  } catch {
    return NextResponse.json({ message: "Password reset is not configured." }, { status: 503 });
  }
  if (!userId) {
    return NextResponse.json({ message: "Your verification has expired. Request a new code." }, { status: 401 });
  }
  const body = await readJsonObject(request);
  if (!isStrongPassword(body?.password)) {
    return NextResponse.json({ message: "Use 8–128 characters with upper and lowercase letters, a number, and a symbol." }, { status: 400 });
  }
  const upstream = await callPublicApi("/otp/reset-password", { userId, password: body.password });
  if (!upstream.ok) return upstream;
  const data = await upstream.json();
  const response = NextResponse.json(data);
  clearPasswordResetGrant(response);
  return response;
}
