import { NextRequest, NextResponse } from "next/server";
import {
  authCookieNames,
  clearSession,
  decodeSessionUser,
  decodeTokenImpersonation,
} from "@/services/auth/session";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const token = request.cookies.get(authCookieNames.token)?.value;
  const user = decodeSessionUser(
    request.cookies.get(authCookieNames.user)?.value,
  );
  const impersonation = decodeTokenImpersonation(token);

  if (!token || !user) {
    const response = NextResponse.json({ authenticated: false, user: null });
    clearSession(response);
    return response;
  }

  return NextResponse.json({
    authenticated: true,
    user,
    impersonation: impersonation
      ? {
          ...impersonation,
          adminReturnUrl:
            process.env.ADMIN_WEB_URL ?? "http://localhost:3000/general/users",
        }
      : null,
  });
}
