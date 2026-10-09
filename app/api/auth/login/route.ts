import { NextResponse } from "next/server";
import { isValidEmail, readJsonObject } from "@/services/api/request-security";
import { callPublicApi } from "@/services/api/server";
import { applySession } from "@/services/auth/session";
import type { AuthSuccess } from "@/modules/account/types";

export async function POST(request: Request) {
  const body = await readJsonObject(request);
  const { email, password } = body ?? {};
  if (!isValidEmail(email) || typeof password !== "string" || !password || password.length > 128) {
    return NextResponse.json({ message: "Enter your email and password." }, { status: 400 });
  }
  const upstream = await callPublicApi("/auth/shared/login/email", {
    email,
    password,
    app_type: "customer",
  });

  if (!upstream.ok) return upstream;

  const data = (await upstream.json()) as AuthSuccess;
  const response = NextResponse.json({ user: data.user });
  applySession(response, data);
  return response;
}
