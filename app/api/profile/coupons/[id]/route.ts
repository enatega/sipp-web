import { NextRequest, NextResponse } from "next/server";
import { callApi, requireSession } from "@/services/api/server";
import { readJsonObject, rejectCrossSiteRequest } from "@/services/api/request-security";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function POST(request: NextRequest, context: RouteContext<"/api/profile/coupons/[id]">) {
  const rejected = rejectCrossSiteRequest(request) ?? requireSession(request);
  if (rejected) return rejected;
  const { id } = await context.params;
  const body = await readJsonObject(request);
  if (!UUID_PATTERN.test(id) || typeof body?.isActive !== "boolean") {
    return NextResponse.json({ message: "Invalid coupon selection." }, { status: 400 });
  }
  return callApi(`/apps/deliveries/customer-coupons/use/${encodeURIComponent(id)}`, {
    method: "POST",
    request,
    body: { isActive: body.isActive },
  });
}
