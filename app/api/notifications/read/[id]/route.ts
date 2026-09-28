import { NextRequest, NextResponse } from "next/server";
import { callApi, requireSession } from "@/services/api/server";
import { rejectCrossSiteRequest } from "@/services/api/request-security";

export async function PATCH(request: NextRequest, context: RouteContext<"/api/notifications/read/[id]">) {
  const rejected = rejectCrossSiteRequest(request) ?? requireSession(request);
  if (rejected) return rejected;
  const { id } = await context.params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) {
    return NextResponse.json({ message: "Invalid notification ID." }, { status: 400 });
  }
  return callApi(`/apps/deliveries/users-notifications/mark-read/${encodeURIComponent(id)}`, { method: "PATCH", request });
}
