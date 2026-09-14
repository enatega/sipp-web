import "server-only";

import { NextRequest, NextResponse } from "next/server";
import { callApi, requireSession } from "@/services/api/server";

interface QueryOptions {
  acceptsLocation?: boolean;
  requiresLocation?: boolean;
  acceptsFilters?: boolean;
  requiresAuth?: boolean;
}

const STOCK_VALUES = new Set(["all", "instock", "outofstock"]);
const PRICE_TIERS = new Set(["$", "$$", "$$$", "$$$$"]);
const SORT_VALUES = new Set([
  "recommended",
  "delivery_price",
  "rating",
  "delivery_time",
  "price_low_to_high",
  "price_high_to_low",
  "name",
]);

function pageValue(value: string | null, fallback: number, maximum: number) {
  if (value === null) return fallback;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 0 && parsed <= maximum
    ? parsed
    : null;
}

function coordinate(value: string | null, minimum: number, maximum: number) {
  if (value === null) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= minimum && parsed <= maximum
    ? parsed
    : null;
}

function invalidQuery(message: string) {
  return NextResponse.json({ message }, { status: 400 });
}

export function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

export function proxyDiscoveryRequest(
  request: NextRequest,
  upstreamPath: string,
  options: QueryOptions = {},
) {
  if (options.requiresAuth !== false) {
    const unauthorized = requireSession(request);
    if (unauthorized) return unauthorized;
  }

  const incoming = request.nextUrl.searchParams;
  const offset = pageValue(incoming.get("offset"), 0, 10_000);
  const limit = pageValue(incoming.get("limit"), 10, 100);
  if (offset === null || limit === null || limit < 1) {
    return invalidQuery("Invalid discovery pagination.");
  }

  const query = new URLSearchParams({
    offset: String(offset),
    limit: String(limit),
  });

  if (options.acceptsLocation || options.requiresLocation) {
    const rawLatitude = incoming.get("latitude");
    const rawLongitude = incoming.get("longitude");
    const hasOneCoordinate = rawLatitude !== null || rawLongitude !== null;
    const latitude = coordinate(rawLatitude, -90, 90);
    const longitude = coordinate(rawLongitude, -180, 180);

    if (
      (options.requiresLocation && (latitude === null || longitude === null)) ||
      (hasOneCoordinate && (latitude === null || longitude === null))
    ) {
      return invalidQuery("A valid delivery location is required.");
    }

    if (latitude !== null && longitude !== null) {
      query.set("latitude", String(latitude));
      query.set("longitude", String(longitude));
    }
  }

  const search = incoming.get("search")?.trim();
  if (search) {
    if (search.length > 80) return invalidQuery("Discovery search is too long.");
    query.set("search", search);
  }

  if (options.acceptsFilters) {
    const stock = incoming.get("stock");
    const sortBy = incoming.get("sort_by");
    const shopTypeId = incoming.get("shop_type_id");
    const tiers = incoming.getAll("price_tiers").flatMap((value) => value.split(",")).filter(Boolean);
    if (stock && !STOCK_VALUES.has(stock)) return invalidQuery("Invalid stock filter.");
    if (sortBy && !SORT_VALUES.has(sortBy)) return invalidQuery("Invalid discovery sort.");
    if (shopTypeId && !isUuid(shopTypeId)) return invalidQuery("Invalid shop type filter.");
    if (tiers.some((tier) => !PRICE_TIERS.has(tier))) return invalidQuery("Invalid price filter.");
    if (stock) query.set("stock", stock);
    if (sortBy) query.set("sort_by", sortBy);
    if (shopTypeId) query.set("shop_type_id", shopTypeId);
    tiers.forEach((tier) => query.append("price_tiers", tier));
  }

  return callApi(`${upstreamPath}?${query.toString()}`, { request });
}
