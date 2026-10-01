import { NextResponse } from "next/server";
import { callPublicApi } from "@/services/api/server";
import { applySession } from "@/services/auth/session";
import type { AuthSuccess } from "@/modules/account/types";

export async function POST(request: Request) {
  const body: unknown = await request.json().catch(() => null);
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ message: "Invalid verification request." }, { status: 400 });
  }
  const candidate = body as Record<string, unknown>;
  const email = typeof candidate.email === "string" ? candidate.email.trim().toLowerCase() : "";
  const phone = typeof candidate.phone === "string" ? candidate.phone.trim() : "";
  const otp = typeof candidate.otp === "string" ? candidate.otp.trim() : "";
  const name = typeof candidate.name === "string" ? candidate.name.trim() : "";
  const password = typeof candidate.password === "string" ? candidate.password : "";
  if (!email || !phone || !/^\d{4}$/.test(otp) || !name || !password) {
    return NextResponse.json({ message: "Invalid verification details." }, { status: 400 });
  }
  const upstream = await callPublicApi("/auth/shared/signup/verify-otp", {
    email,
    phone,
    otp,
    name,
    password,
    otp_type: "sms",
  });

  if (!upstream.ok) return upstream;

  const data = (await upstream.json()) as AuthSuccess;
  const response = NextResponse.json({ user: data.user });
  applySession(response, data);
  return response;
}
