import { NextRequest } from "next/server";
import { callApi } from "@/services/api/server";
import { clearSession } from "@/services/auth/session";
import { rejectCrossSiteRequest } from "@/services/api/request-security";

export async function POST(request: NextRequest) {
  const rejected = rejectCrossSiteRequest(request);
  if (rejected) return rejected;

  const response = await callApi("/auth/impersonation/exit", {
    method: "POST",
    request,
  });
  if (response.ok) clearSession(response);
  return response;
}
