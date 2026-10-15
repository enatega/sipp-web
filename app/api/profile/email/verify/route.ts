import { NextRequest, NextResponse } from "next/server";
import { callApi, requireSession } from "@/services/api/server";
import { rejectCrossSiteRequest, readJsonObject } from "@/services/api/request-security";

export async function POST(request: NextRequest) {
  const rejected = rejectCrossSiteRequest(request) ?? requireSession(request);
  if (rejected) return rejected;

  const body = await readJsonObject(request);
  const email = typeof body?.email === "string" ? body.email.trim() : "";
  const otp = typeof body?.otp === "string" ? body.otp.trim() : "";
  if (!email || !/^\d{4}$/.test(otp)) {
    return NextResponse.json(
      { message: "Enter a valid email and four-digit code." },
      { status: 400 },
    );
  }

  return callApi("/apps/deliveries/profile/email/verify-otp", {
    request,
    method: "POST",
    body: { email, otp },
  });
}
