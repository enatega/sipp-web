import { NextRequest, NextResponse } from "next/server";
import { authCookieNames } from "@/services/auth/session";
import { callApi, requireSession } from "@/services/api/server";

function socketBaseUrl() {
  const configured =
    process.env.SHAANIEOL_SOCKET_URL ??
    process.env.NEXT_PUBLIC_SOCKET_URL ??
    process.env.API_BASE_URL ??
    "http://localhost:8080/api/v1";
  return new URL(configured).origin;
}

export async function GET(request: NextRequest) {
  const denied = requireSession(request);
  if (denied) return denied;

  const token = request.cookies.get(authCookieNames.token)?.value;
  if (!token) {
    return NextResponse.json({ message: "Sign in to continue." }, { status: 401 });
  }

  const profile = await callApi("/apps/deliveries/profile", { request });
  if (!profile.ok) return profile;

  const body = await profile.json();
  const userId = body?.data?.user?.id;
  if (typeof userId !== "string" || !userId) {
    return NextResponse.json({ message: "Sign in to continue." }, { status: 401 });
  }

  return NextResponse.json({
    token,
    userId,
    url: `${socketBaseUrl()}/deliveries`,
    path:
      process.env.SHAANIEOL_SOCKET_PATH ??
      process.env.NEXT_PUBLIC_SOCKET_PATH ??
      "/socket.io",
  });
}
