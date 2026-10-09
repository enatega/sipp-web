import { NextRequest, NextResponse } from "next/server";
import { callApi, requireSession } from "@/services/api/server";
import { rejectCrossSiteRequest, readJsonObject } from "@/services/api/request-security";

export async function POST(request: NextRequest) {
  const rejected = rejectCrossSiteRequest(request) ?? requireSession(request);
  if (rejected) return rejected;
  const body = await readJsonObject(request);
  const phone = typeof body?.phone === "string" ? body.phone.trim() : "";
  if (!/^\+[1-9]\d{7,14}$/.test(phone)) {
    return NextResponse.json({ message: "Enter a valid international phone number." }, { status: 400 });
  }
  return callApi("/apps/deliveries/profile/phone/send-otp", { request, method: "POST", body: { phone } });
}
