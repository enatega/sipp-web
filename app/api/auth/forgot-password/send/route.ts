import { NextRequest, NextResponse } from "next/server";
import { callPublicApi } from "@/services/api/server";
import { isValidEmail, readJsonObject, rejectCrossSiteRequest } from "@/services/api/request-security";

export async function POST(request: NextRequest) {
  const rejected = rejectCrossSiteRequest(request);
  if (rejected) return rejected;
  const body = await readJsonObject(request);
  const email = body?.email;
  if (!isValidEmail(email)) {
    return NextResponse.json({ message: "Enter a valid email address." }, { status: 400 });
  }
  return callPublicApi("/otp/send", { email: email.trim().toLowerCase(), otp_type: "email" });
}
