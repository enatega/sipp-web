import { NextRequest, NextResponse } from "next/server";
import { callApi, requireSession } from "@/services/api/server";

const PERIODS = new Set(["today", "past"]);

export async function GET(request: NextRequest, context: RouteContext<"/api/notifications/[period]">) {
  const unauthorized = requireSession(request);
  if (unauthorized) return unauthorized;

  const { period } = await context.params;
  const offset = Number(request.nextUrl.searchParams.get("offset") ?? 0);
  const limit = Number(request.nextUrl.searchParams.get("limit") ?? 10);
  if (!PERIODS.has(period) || !Number.isInteger(offset) || offset < 0 || offset > 100_000 || !Number.isInteger(limit) || limit < 1 || limit > 50) {
    return NextResponse.json({ message: "Invalid notification query." }, { status: 400 });
  }

  return callApi(`/apps/deliveries/users-notifications/${period}?offset=${offset}&limit=${limit}`, { request });
}
