import { NextRequest, NextResponse } from "next/server";
import { callApi, requireSession } from "@/services/api/server";
import { rejectCrossSiteRequest, sessionEmail } from "@/services/api/request-security";

export async function POST(request: NextRequest) {
  const rejected = rejectCrossSiteRequest(request) ?? requireSession(request);
  if (rejected) return rejected;
  const email = sessionEmail(request);
  if (!email) {
    return NextResponse.json({ message: "Add an email address before changing your password." }, { status: 400 });
  }
  return callApi("/apps/deliveries/settings/change-password/send-otp", {
    method: "POST",
    body: { email },
    request,
  });
}
