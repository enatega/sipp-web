import { NextRequest } from "next/server";
import { callApi, requireSession } from "@/services/api/server";
import { rejectCrossSiteRequest } from "@/services/api/request-security";

export async function POST(request: NextRequest) {
  const rejected = rejectCrossSiteRequest(request) ?? requireSession(request);
  if (rejected) return rejected;

  return callApi("/apps/deliveries/profile/email/send-otp", {
    request,
    method: "POST",
  });
}
