import { NextRequest, NextResponse } from "next/server";
import { callApi, requireSession } from "@/services/api/server";
import { readJsonObject, rejectCrossSiteRequest } from "@/services/api/request-security";

function couponCode(value: unknown) {
  if (typeof value !== "string") return null;
  const normalized = value.trim().toUpperCase();
  return normalized.length >= 2 && normalized.length <= 64 && /^[A-Z0-9_-]+$/.test(normalized)
    ? normalized
    : null;
}

export function GET(request: NextRequest) {
  const unauthorized = requireSession(request);
  if (unauthorized) return unauthorized;
  const offset = Number(request.nextUrl.searchParams.get("offset") ?? 0);
  const limit = Number(request.nextUrl.searchParams.get("limit") ?? 12);
  if (!Number.isInteger(offset) || offset < 0 || offset > 100_000 || !Number.isInteger(limit) || limit < 1 || limit > 50) {
    return NextResponse.json({ message: "Invalid coupon pagination." }, { status: 400 });
  }
  return callApi(`/apps/deliveries/customer-coupons/claimed?offset=${offset}&limit=${limit}`, { request });
}

export async function POST(request: NextRequest) {
  const rejected = rejectCrossSiteRequest(request) ?? requireSession(request);
  if (rejected) return rejected;
  const body = await readJsonObject(request);
  const code = couponCode(body?.code);
  if (!code) {
    return NextResponse.json({ message: "Enter a valid coupon code." }, { status: 400 });
  }
  return callApi("/apps/deliveries/customer-coupons/claim", {
    method: "POST",
    request,
    body: { code },
  });
}
