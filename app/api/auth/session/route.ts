import { NextRequest, NextResponse } from "next/server";
import {
  authCookieNames,
  clearSession,
  decodeSessionUser,
  decodeTokenImpersonation,
} from "@/services/auth/session";
import { optionalServerEnv } from "@/services/api/env";

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
          // Unset in production -> omitted; the banner then returns to "/".
          adminReturnUrl:
            optionalServerEnv("ADMIN_WEB_URL", "http://localhost:3000/general/users") ?? undefined,
        }
      : null,
  });
}
