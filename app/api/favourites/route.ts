import { NextRequest } from "next/server";
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
  return callApi("/apps/deliveries/favorite-stores/toggle", {
    method: "POST",
    body: await request.json(),
    request,
  });
}
