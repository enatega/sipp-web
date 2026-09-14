import { NextRequest } from "next/server";
import { callApi, requireSession } from "@/services/api/server";
export const dynamic = "force-dynamic";
export async function GET(request: NextRequest) {
  const unauthorized = requireSession(request); if (unauthorized) return unauthorized;
  const query = request.nextUrl.searchParams.toString();
  return callApi(`/apps/deliveries/orders/past${query ? `?${query}` : ""}`, { request });
}
