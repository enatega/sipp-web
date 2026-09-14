import { NextResponse } from "next/server";
import { callPublicApi } from "@/services/api/server";
import { applySession } from "@/services/auth/session";
import type { AuthSuccess } from "@/modules/account/types";

export async function POST(request: Request) {
  const body = await request.json();
  const upstream = await callPublicApi("/auth/shared/login/phone/verify-otp", {
    ...body,
    app_type: "customer",
  });

  if (!upstream.ok) return upstream;

  const data = (await upstream.json()) as AuthSuccess;
  const response = NextResponse.json({ user: data.user });
  applySession(response, data);
  return response;
}
