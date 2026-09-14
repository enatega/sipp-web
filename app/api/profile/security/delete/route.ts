import { NextRequest, NextResponse } from "next/server";
import { callApi, requireSession } from "@/services/api/server";
import { rejectCrossSiteRequest, readJsonObject, sessionEmail } from "@/services/api/request-security";
import { clearSession } from "@/services/auth/session";

const deletionReasons = {
  no_longer_needed: "I no longer need my Shaaneiol account",
  cannot_find_stores: "I cannot find the stores or products I need",
  privacy_concerns: "I have privacy or security concerns",
  poor_experience: "I had a poor experience with the service",
  other: "Other reason",
} as const;

export async function PATCH(request: NextRequest) {
  const rejected = rejectCrossSiteRequest(request) ?? requireSession(request);
  if (rejected) return rejected;
  const body = await readJsonObject(request);
  const email = sessionEmail(request);
  const reason = typeof body?.reason === "string" && body.reason in deletionReasons
    ? deletionReasons[body.reason as keyof typeof deletionReasons]
    : null;
  const confirmationEmail = typeof body?.confirmationEmail === "string"
    ? body.confirmationEmail.trim().toLowerCase()
    : "";
  if (!email || confirmationEmail !== email || !reason) {
    return NextResponse.json({ message: "Confirm your account email and select a deletion reason." }, { status: 400 });
  }
  const upstream = await callApi(`/auth/soft-delete?message=${encodeURIComponent(reason)}`, {
    method: "PATCH",
    request,
  });
  if (!upstream.ok) return upstream;
  const data = await upstream.json();
  const response = NextResponse.json(data);
  clearSession(response);
  return response;
}
