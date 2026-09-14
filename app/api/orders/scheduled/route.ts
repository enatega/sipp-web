import { NextRequest } from "next/server";
import { callApi, requireSession } from "@/services/api/server";

export const dynamic = "force-dynamic";

function pageNumber(value: string | null, fallback: number, maximum: number) {
  if (value === null) return fallback;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 0 && parsed <= maximum
    ? parsed
    : fallback;
}

export async function GET(request: NextRequest) {
  const unauthorized = requireSession(request);
  if (unauthorized) return unauthorized;

  const offset = pageNumber(request.nextUrl.searchParams.get("offset"), 0, 100_000);
  const limit = pageNumber(request.nextUrl.searchParams.get("limit"), 10, 50);
  const query = new URLSearchParams({
    offset: String(offset),
    limit: String(Math.max(1, limit)),
  });

  return callApi(`/apps/deliveries/orders/scheduled?${query}`, { request });
}
