import { NextRequest, NextResponse } from "next/server";
import {
  authCookieNames,
  clearSession,
  decodeSessionUser,
} from "@/services/auth/session";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const token = request.cookies.get(authCookieNames.token)?.value;
  const user = decodeSessionUser(
    request.cookies.get(authCookieNames.user)?.value,
  );

  if (!token || !user) {
    const response = NextResponse.json({ authenticated: false, user: null });
    clearSession(response);
    return response;
  }

  return NextResponse.json({ authenticated: true, user });
}
