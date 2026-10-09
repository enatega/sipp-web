import { NextRequest, NextResponse } from "next/server";
import { callApi, requireSession } from "@/services/api/server";
import { rejectCrossSiteRequest, readJsonObject } from "@/services/api/request-security";

export async function POST(request: NextRequest) {
  const rejected = rejectCrossSiteRequest(request) ?? requireSession(request);
  if (rejected) return rejected;
  const body = await readJsonObject(request);
  const phone = typeof body?.phone === "string" ? body.phone.trim() : "";
  const otp = typeof body?.otp === "string" ? body.otp.trim() : "";
  if (!/^\+[1-9]\d{7,14}$/.test(phone) || !/^\d{4}$/.test(otp)) {
    return NextResponse.json({ message: "Enter a valid phone and four-digit code." }, { status: 400 });
  }
  return callApi("/apps/deliveries/profile/phone/verify-otp", { request, method: "POST", body: { phone, otp } });
}
