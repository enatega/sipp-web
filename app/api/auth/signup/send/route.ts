import { callPublicApi } from "@/services/api/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body: unknown = await request.json().catch(() => null);
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ message: "Invalid sign-up request." }, { status: 400 });
  }
  const candidate = body as Record<string, unknown>;
  const email = typeof candidate.email === "string" ? candidate.email.trim().toLowerCase() : "";
  const phone = typeof candidate.phone === "string" ? candidate.phone.trim() : "";
  if (!email || !phone) {
    return NextResponse.json({ message: "Email and phone number are required." }, { status: 400 });
  }
  return callPublicApi("/auth/shared/signup/send-otp", {
    email,
    phone,
    otp_type: "sms",
  });
}
