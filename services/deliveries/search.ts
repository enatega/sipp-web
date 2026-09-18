import "server-only";

import { NextRequest, NextResponse } from "next/server";
import { callApi, requireSession } from "@/services/api/server";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function invalid(message: string) {
  return NextResponse.json({ message }, { status: 400 });
}

export function proxySearchRequest(
  request: NextRequest,
  endpoint: "results" | "products" | "stores" | "recommendations" | "recent-searches",
) {
  if (endpoint === "recent-searches") {
    const unauthorized = requireSession(request);
    if (unauthorized) return unauthorized;
  }
  const incoming = request.nextUrl.searchParams;
  const outgoing = new URLSearchParams();
  const keyword = (incoming.get("q") ?? incoming.get("keyword") ?? "").trim();
  if (keyword.length > 80) return invalid("Search text is too long.");
  if (keyword) outgoing.set("keyword", keyword);

  const keys = endpoint === "results"
    ? ["productOffset", "productLimit", "storeOffset", "storeLimit"]
    : endpoint === "recommendations"
      ? ["limit"]
      : ["offset", "limit"];
  for (const key of keys) {
    const value = incoming.get(key);
    if (value === null) continue;
    const parsed = Number(value);
    const max = key.toLowerCase().includes("limit") ? 100 : 10_000;
    if (!Number.isInteger(parsed) || parsed < (key.toLowerCase().includes("limit") ? 1 : 0) || parsed > max) {
      return invalid("Invalid search pagination.");
    }
    outgoing.set(key, String(parsed));
  }

  for (const [key, minimum, maximum] of [
    ["latitude", -90, 90],
    ["longitude", -180, 180],
  ] as const) {
    const value = incoming.get(key);
    if (value === null) continue;
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed < minimum || parsed > maximum) {
      return invalid("Invalid delivery location.");
    }
    outgoing.set(key, String(parsed));
  }
  const hasLatitude = outgoing.has("latitude");
  const hasLongitude = outgoing.has("longitude");
  if (hasLatitude !== hasLongitude) return invalid("A complete delivery location is required.");

  const categoryId = incoming.get("categoryId");
  if (categoryId) {
    if (!UUID.test(categoryId)) return invalid("Invalid category.");
    outgoing.set("categoryId", categoryId);
  }
  return callApi(`/apps/deliveries/search/${endpoint}?${outgoing}`, { request });
}

export async function proxySearchEvent(request: NextRequest) {
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  const eventNames = new Set(["Product Opened", "Store Opened", "Product Ordered"]);
  if (!body || !["click", "conversion"].includes(String(body.eventType)) ||
      !["product", "store"].includes(String(body.resourceType)) ||
      !eventNames.has(String(body.eventName)) ||
      typeof body.queryId !== "string" || !/^[a-f0-9]{32}$/i.test(body.queryId) ||
      typeof body.objectId !== "string" || !UUID.test(body.objectId)) {
    return invalid("Invalid search event.");
  }
  return callApi("/apps/deliveries/search/events", { method: "POST", body, request });
}

export async function proxyRecentSearchMutation(
  request: NextRequest,
  method: "POST" | "DELETE",
  id?: string,
) {
  const unauthorized = requireSession(request);
  if (unauthorized) return unauthorized;
  if (id && !UUID.test(id)) return invalid("Invalid recent search.");
  if (method === "POST") {
    const body = await request.json().catch(() => null) as { term?: unknown } | null;
    const term = typeof body?.term === "string" ? body.term.trim() : "";
    if (!term || term.length > 80) return invalid("Invalid search text.");
    return callApi("/apps/deliveries/search/recent-searches", {
      method,
      body: { term },
      request,
    });
  }
  return callApi(
    `/apps/deliveries/search/recent-searches${id ? `/${id}` : ""}`,
    { method, request },
  );
}
