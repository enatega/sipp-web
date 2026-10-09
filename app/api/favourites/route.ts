import { NextRequest, NextResponse } from "next/server";
import { isUuid, readJsonObject } from "@/services/api/request-security";
import { callApi, requireSession } from "@/services/api/server";

export async function GET(request: NextRequest) {
  const unauthorized = requireSession(request);
  if (unauthorized) return unauthorized;
  const query = request.nextUrl.search;
  return callApi(`/apps/deliveries/favorite-stores${query}`, { request });
}

export async function POST(request: NextRequest) {
  const unauthorized = requireSession(request);
  if (unauthorized) return unauthorized;
  const storeId = (await readJsonObject(request))?.storeId;
  if (!isUuid(storeId)) {
    return NextResponse.json({ message: "Invalid store identifier." }, { status: 400 });
  }
  return callApi("/apps/deliveries/favorite-stores/toggle", {
    method: "POST",
    body: { storeId },
    request,
  });
}
