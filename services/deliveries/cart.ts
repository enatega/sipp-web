import "server-only";

import { NextRequest, NextResponse } from "next/server";
import { callApi, requireSession } from "@/services/api/server";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function invalid(message: string) {
  return NextResponse.json({ message }, { status: 400 });
}

type Selection = { groupId: string; optionId: string };

function parseAddItemBody(value: unknown) {
  if (!value || typeof value !== "object") return null;
  const source = value as Record<string, unknown>;
  const quantity = source.quantity === undefined ? 1 : Number(source.quantity);
  if (
    typeof source.productId !== "string" ||
    !UUID_PATTERN.test(source.productId) ||
    !Number.isInteger(quantity) ||
    quantity < 1 ||
    quantity > 99
  ) return null;
  if (source.selectedOptions !== undefined && !Array.isArray(source.selectedOptions)) {
    return null;
  }
  const selectedOptions: Selection[] = [];
  for (const value of Array.isArray(source.selectedOptions) ? source.selectedOptions : []) {
    if (!value || typeof value !== "object") return null;
    const option = value as Record<string, unknown>;
    if (
      typeof option.groupId !== "string" ||
      typeof option.optionId !== "string" ||
      !UUID_PATTERN.test(option.groupId) ||
      !UUID_PATTERN.test(option.optionId)
    ) return null;
    selectedOptions.push({ groupId: option.groupId, optionId: option.optionId });
  }
  return { productId: source.productId, quantity, ...(selectedOptions.length ? { selectedOptions } : {}) };
}

export async function proxyCartCollection(request: NextRequest) {
  const unauthorized = requireSession(request);
  if (unauthorized) return unauthorized;
  if (request.method === "GET") return callApi("/apps/deliveries/buckets/cart", { request });
  if (request.method === "DELETE") {
    return callApi("/apps/deliveries/buckets/cart", { method: "DELETE", request });
  }
  const body = parseAddItemBody(await request.json().catch(() => null));
  if (!body) return invalid("Invalid cart item.");
  return callApi("/apps/deliveries/buckets/cart/items", { method: "POST", request, body });
}

export async function proxyCartItem(request: NextRequest, itemId: string) {
  const unauthorized = requireSession(request);
  if (unauthorized) return unauthorized;
  if (!UUID_PATTERN.test(itemId)) return invalid("Invalid cart item identifier.");
  const path = `/apps/deliveries/buckets/cart/items/${encodeURIComponent(itemId)}`;
  if (request.method === "DELETE") return callApi(path, { method: "DELETE", request });
  const source = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const quantity = Number(source?.quantity);
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
    return invalid("Quantity must be between 1 and 99.");
  }
  return callApi(`${path}/quantity`, { method: "PATCH", request, body: { quantity } });
}

