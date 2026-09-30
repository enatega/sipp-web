import "server-only";

import { NextRequest, NextResponse } from "next/server";
import { callApi, requireSession } from "@/services/api/server";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const ORDER_TYPES = ["delivery", "pickup"] as const;
const PAYMENT_METHODS = ["wallet", "stripe"] as const;
const PAYMENT_METHOD_ID_PATTERN = /^pm_[A-Za-z0-9]+$/;

function invalid(message: string) {
  return NextResponse.json({ message }, { status: 400 });
}

function positiveNumber(value: unknown) {
  if (value === undefined || value === null || value === "") return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 && parsed <= 10_000 ? parsed : null;
}

function isoDate(value: unknown) {
  if (value === undefined || value === null || value === "") return undefined;
  if (typeof value !== "string" || Number.isNaN(Date.parse(value))) return null;
  return value;
}

function boundedNumber(value: unknown, minimum: number, maximum: number) {
  if (value === undefined || value === null || value === "") return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= minimum && parsed <= maximum
    ? parsed
    : null;
}

function commonInput(source: Record<string, unknown>) {
  const orderType = source.orderType;
  const paymentMethod = source.paymentMethod;
  const addressId = source.addressId;
  const deliveryAddress = typeof source.deliveryAddress === "string"
    ? source.deliveryAddress.trim()
    : undefined;
  const deliveryLatitude = boundedNumber(source.deliveryLatitude, -90, 90);
  const deliveryLongitude = boundedNumber(source.deliveryLongitude, -180, 180);
  const deliveryLabel = typeof source.deliveryLabel === "string"
    ? source.deliveryLabel.trim()
    : undefined;
  const hasDirectAddressValue =
    source.deliveryAddress !== undefined ||
    source.deliveryLatitude !== undefined ||
    source.deliveryLongitude !== undefined ||
    source.deliveryLabel !== undefined;
  const hasValidDirectAddress =
    Boolean(deliveryAddress) &&
    deliveryAddress!.length <= 1000 &&
    deliveryLatitude !== undefined &&
    deliveryLatitude !== null &&
    deliveryLongitude !== undefined &&
    deliveryLongitude !== null &&
    (!deliveryLabel || deliveryLabel.length <= 255);
  const riderTip = positiveNumber(source.riderTip);
  const scheduledAt = isoDate(source.scheduledAt);
  if (
    typeof source.storeId !== "string" || !UUID_PATTERN.test(source.storeId) ||
    typeof source.bucketId !== "string" || !UUID_PATTERN.test(source.bucketId) ||
    !ORDER_TYPES.includes(orderType as (typeof ORDER_TYPES)[number]) ||
    !PAYMENT_METHODS.includes(paymentMethod as (typeof PAYMENT_METHODS)[number]) ||
    (orderType === "delivery" &&
      !(
        (typeof addressId === "string" && UUID_PATTERN.test(addressId)) ||
        hasValidDirectAddress
      )) ||
    (addressId !== undefined && (typeof addressId !== "string" || !UUID_PATTERN.test(addressId))) ||
    (addressId !== undefined && hasDirectAddressValue) ||
    (orderType === "pickup" && (addressId !== undefined || hasDirectAddressValue)) ||
    (hasDirectAddressValue && !hasValidDirectAddress) ||
    riderTip === null || scheduledAt === null
  ) return null;
  return {
    storeId: source.storeId,
    bucketId: source.bucketId,
    orderType,
    paymentMethod,
    ...(addressId ? { addressId } : {}),
    ...(deliveryAddress ? { deliveryAddress } : {}),
    ...(deliveryLatitude !== undefined ? { deliveryLatitude } : {}),
    ...(deliveryLongitude !== undefined ? { deliveryLongitude } : {}),
    ...(deliveryLabel ? { deliveryLabel } : {}),
    ...(riderTip && riderTip > 0 ? { riderTip } : {}),
    ...(scheduledAt ? { scheduledAt } : {}),
  };
}

export function proxyCheckoutPreview(request: NextRequest) {
  const unauthorized = requireSession(request);
  if (unauthorized) return unauthorized;
  const source = Object.fromEntries(request.nextUrl.searchParams.entries());
  const input = commonInput(source);
  if (!input) return invalid("Invalid checkout details.");
  if (!PAYMENT_METHODS.includes(source.paymentMethod as (typeof PAYMENT_METHODS)[number])) {
    return invalid("Please select Wallet or Card as your payment method.");
  }
  const query = new URLSearchParams();
  Object.entries(input).forEach(([key, value]) => query.set(key, String(value)));
  query.set("paymentMethod", source.paymentMethod);
  return callApi(`/apps/deliveries/orders/place-order/preview?${query}`, { request });
}

export async function proxyPlaceOrder(request: NextRequest) {
  const unauthorized = requireSession(request);
  if (unauthorized) return unauthorized;
  const source = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!source) return invalid("Your order details could not be read. Please refresh checkout and try again.");
  const input = commonInput(source);
  if (!input) {
    return invalid("Please check your cart, store, delivery address, and delivery details before placing the order.");
  }
  if (!PAYMENT_METHODS.includes(source.paymentMethod as (typeof PAYMENT_METHODS)[number])) {
    return invalid("Please select Wallet or Card as your payment method.");
  }
  const customerNote = typeof source.customerNote === "string" ? source.customerNote.trim() : "";
  if (customerNote.length > 500) return invalid("Order notes are too long.");
  const paymentMethodId = source.paymentMethodId;
  if (
    paymentMethodId !== undefined &&
    (source.paymentMethod !== "stripe" ||
      typeof paymentMethodId !== "string" ||
      !PAYMENT_METHOD_ID_PATTERN.test(paymentMethodId) ||
      paymentMethodId.length > 255)
  ) return invalid("Invalid saved card selection.");
  const successUrl = new URL("/checkout?payment=return", request.url).toString();
  const cancelUrl = new URL("/checkout?payment=cancelled", request.url).toString();
  return callApi("/apps/deliveries/orders", {
    method: "POST",
    request,
    body: { ...input, paymentMethod: source.paymentMethod, ...(paymentMethodId ? { paymentMethodId } : {}), ...(customerNote ? { customerNote } : {}), ...(source.paymentMethod === "stripe" && !paymentMethodId ? { successUrl, cancelUrl } : {}) },
  });
}

export function proxyStripeOrderStatus(request: NextRequest, draftId: string) {
  const unauthorized = requireSession(request);
  if (unauthorized) return unauthorized;
  if (!UUID_PATTERN.test(draftId)) return invalid("Invalid payment identifier.");
  return callApi(
    `/apps/deliveries/orders/stripe/drafts/${encodeURIComponent(draftId)}/status`,
    { request },
  );
}

export function proxyCheckoutSchedule(request: NextRequest, storeId: string) {
  const unauthorized = requireSession(request);
  if (unauthorized) return unauthorized;
  if (!UUID_PATTERN.test(storeId)) return invalid("Invalid store identifier.");
  const days = Math.min(7, Math.max(1, Number(request.nextUrl.searchParams.get("days")) || 5));
  const slotMinutes = Math.min(180, Math.max(15, Number(request.nextUrl.searchParams.get("slotMinutes")) || 60));
  return callApi(`/apps/deliveries/orders/schedule-slots/${encodeURIComponent(storeId)}?days=${days}&slotMinutes=${slotMinutes}`, { request });
}
