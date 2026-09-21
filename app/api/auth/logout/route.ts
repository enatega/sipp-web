import { NextRequest, NextResponse } from "next/server";
import {
  authCookieNames,
  clearSession,
  decodeTokenImpersonation,
} from "@/services/auth/session";
import { callApi } from "@/services/api/server";

export async function POST(request: NextRequest) {
  const token = request.cookies.get(authCookieNames.token)?.value;
  if (decodeTokenImpersonation(token)) {
    await callApi("/auth/impersonation/exit", {
      method: "POST",
      request,
    });
  }
  const response = NextResponse.json({ success: true });
  clearSession(response);
  return response;
}
