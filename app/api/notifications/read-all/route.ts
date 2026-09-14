import { NextRequest } from "next/server";
import { callApi, requireSession } from "@/services/api/server";
import { rejectCrossSiteRequest } from "@/services/api/request-security";

export function PATCH(request: NextRequest) {
  const rejected = rejectCrossSiteRequest(request) ?? requireSession(request);
  if (rejected) return rejected;
  return callApi("/apps/deliveries/users-notifications/mark-all-read", {
    method: "PATCH",
    request,
  });
}
