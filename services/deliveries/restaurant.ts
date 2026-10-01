import "server-only";

import { NextRequest, NextResponse } from "next/server";
import { callApi } from "@/services/api/server";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function invalid(message: string) {
  return NextResponse.json({ message }, { status: 400 });
}

export function resolveRestaurantSlug(request: NextRequest, slug: string) {
  if (!SLUG_PATTERN.test(slug) || slug.length > 100) {
    return invalid("Invalid restaurant slug.");
  }
  return callApi(
    `/apps/deliveries/stores/resolve/${encodeURIComponent(slug)}`,
    { request },
  );
}

function coordinate(value: string | null, minimum: number, maximum: number) {
  const parsed = Number(value);
  return value !== null && Number.isFinite(parsed) && parsed >= minimum && parsed <= maximum
    ? parsed
    : null;
}

function pageNumber(value: string | null, fallback: number, maximum: number) {
  if (value === null) return fallback;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 0 && parsed <= maximum
    ? parsed
    : null;
}

export function proxyRestaurantRequest(request: NextRequest, storeId: string) {
  if (!UUID_PATTERN.test(storeId)) return invalid("Invalid store identifier.");

  const incoming = request.nextUrl.searchParams;
  const latitude = coordinate(incoming.get("latitude"), -90, 90);
  const longitude = coordinate(incoming.get("longitude"), -180, 180);
  if (latitude === null || longitude === null) {
    return invalid("A valid delivery location is required.");
  }

  const hasProductQuery = ["offset", "limit", "search", "categoryId", "subcategoryId"].some((key) =>
    incoming.has(key),
  );
  const query = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
  });

  if (hasProductQuery) {
    const offset = pageNumber(incoming.get("offset"), 0, 100_000);
    const limit = pageNumber(incoming.get("limit"), 100, 100);
    if (offset === null || limit === null || limit < 1) {
      return invalid("Invalid product pagination.");
    }
    query.set("offset", String(offset));
    query.set("limit", String(limit));
    const search = incoming.get("search")?.trim();
    if (search) query.set("search", search.slice(0, 120));
    const categoryId = incoming.get("categoryId");
    const subcategoryId = incoming.get("subcategoryId");
    if (categoryId && !UUID_PATTERN.test(categoryId)) {
      return invalid("Invalid category identifier.");
    }
    if (subcategoryId && !UUID_PATTERN.test(subcategoryId)) {
      return invalid("Invalid subcategory identifier.");
    }
    if (subcategoryId && !categoryId) {
      return invalid("A category is required when filtering by subcategory.");
    }
    if (categoryId) query.set("categoryId", categoryId);
    if (subcategoryId) query.set("subcategoryId", subcategoryId);
  }

  const suffix = hasProductQuery ? "/products" : "";
  return callApi(
    `/apps/deliveries/stores/${encodeURIComponent(storeId)}/view${suffix}?${query}`,
    { request },
  );
}

export function proxyProductRequest(
  request: NextRequest,
  productId: string,
  customizations = false,
) {
  if (!UUID_PATTERN.test(productId)) return invalid("Invalid product identifier.");
  return callApi(
    `/apps/deliveries/products/mobile/${encodeURIComponent(productId)}${customizations ? "/customizations" : ""}`,
    { request },
  );
}
