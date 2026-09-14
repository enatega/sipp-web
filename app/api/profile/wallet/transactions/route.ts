import { NextRequest, NextResponse } from "next/server";

import { callApi, requireSession } from "@/services/api/server";

export const dynamic = "force-dynamic";

function parsePageValue(value: string | null, fallback: number, maximum: number) {
  if (value === null) return fallback;
  if (!/^\d+$/.test(value)) return null;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed <= maximum ? parsed : null;
}

export async function GET(request: NextRequest) {
  const unauthorized = requireSession(request);
  if (unauthorized) return unauthorized;

  const offset = parsePageValue(request.nextUrl.searchParams.get("offset"), 0, 100_000);
  const limit = parsePageValue(request.nextUrl.searchParams.get("limit"), 10, 50);

  if (offset === null || limit === null || limit < 1) {
    return NextResponse.json(
      { message: "Invalid wallet transaction pagination." },
      { status: 400 },
    );
  }

  const query = new URLSearchParams({
    offset: String(offset),
    limit: String(limit),
  });

  return callApi(
    `/apps/deliveries/wallet/transaction-history/customer?${query.toString()}`,
    { request },
  );
}
