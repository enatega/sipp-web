import { NextRequest, NextResponse } from "next/server";
import { callPublicApi } from "@/services/api/server";
import { rejectCrossSiteRequest, readJsonObject } from "@/services/api/request-security";

export async function POST(request: NextRequest) {
  const rejected = rejectCrossSiteRequest(request);
  if (rejected) return rejected;
  const body = await readJsonObject(request);
  const idToken = typeof body?.idToken === "string" ? body.idToken : "";
  const phone = typeof body?.phone === "string" ? body.phone.trim() : "";
  if (idToken.length > 12_000 || !/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(idToken) || !/^\+[1-9]\d{7,14}$/.test(phone)) {
    return NextResponse.json({ message: "Enter a valid phone number." }, { status: 400 });
  }
  return callPublicApi("/auth/login/google/phone/send-otp", { idToken, phone });
}
