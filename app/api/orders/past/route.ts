import { NextRequest } from "next/server";
import { paginationQuery } from "@/services/api/request-security";
import { callApi, requireSession } from "@/services/api/server";
export const dynamic = "force-dynamic";
export async function GET(request: NextRequest) {
  const unauthorized = requireSession(request); if (unauthorized) return unauthorized;
  const query = paginationQuery(request.nextUrl.searchParams);
  return callApi(`/apps/deliveries/orders/past?${query}`, { request });
}
