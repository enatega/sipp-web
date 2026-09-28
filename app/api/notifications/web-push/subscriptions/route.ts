import { NextRequest, NextResponse } from "next/server";
import { callApi, requireSession } from "@/services/api/server";
import { rejectCrossSiteRequest } from "@/services/api/request-security";

export async function POST(request: NextRequest) {
  const rejected = rejectCrossSiteRequest(request) ?? requireSession(request);
  if (rejected) return rejected;
  const value = await request.json().catch(() => null) as { endpoint?: unknown; keys?: { p256dh?: unknown; auth?: unknown } } | null;
  if (typeof value?.endpoint !== "string" || typeof value.keys?.p256dh !== "string" || typeof value.keys?.auth !== "string") {
    return NextResponse.json({ message: "Invalid browser subscription." }, { status: 400 });
  }
  return callApi("/apps/deliveries/web-push/subscriptions", {
    method: "POST", request,
    body: { endpoint: value.endpoint, keys: { p256dh: value.keys.p256dh, auth: value.keys.auth } },
  });
}

export async function DELETE(request: NextRequest) {
  const rejected = rejectCrossSiteRequest(request) ?? requireSession(request);
  if (rejected) return rejected;
  const value = await request.json().catch(() => null) as { endpoint?: unknown } | null;
  if (typeof value?.endpoint !== "string") {
    return NextResponse.json({ message: "Invalid browser subscription." }, { status: 400 });
  }
  return callApi("/apps/deliveries/web-push/subscriptions", { method: "DELETE", request, body: { endpoint: value.endpoint } });
}
