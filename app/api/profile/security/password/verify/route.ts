import { NextRequest, NextResponse } from "next/server";
import { callApi, requireSession } from "@/services/api/server";
import { isValidOtp, readJsonObject, rejectCrossSiteRequest, sessionEmail } from "@/services/api/request-security";

export async function POST(request: NextRequest) {
  const rejected = rejectCrossSiteRequest(request) ?? requireSession(request);
  if (rejected) return rejected;
  const email = sessionEmail(request);
  const body = await readJsonObject(request);
  if (!email || !isValidOtp(body?.otp)) {
    return NextResponse.json({ message: "Enter the 4-digit verification code." }, { status: 400 });
  }
  return callApi("/apps/deliveries/settings/change-password/verify-otp", {
    method: "POST",
    body: { email, otp: body.otp },
    request,
  });
}
