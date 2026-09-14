import type { OrderDetail } from "../types/orders";

export const TERMINAL_ORDER_STATUSES = new Set([
  "delivered",
  "cancelled",
  "rejected",
  "failed",
]);

export const RATEABLE_ORDER_STATUSES = new Set(["delivered"]);

const PREPARING_STATUSES = new Set(["accepted", "preparing", "ready"]);
const TRAVELLING_STATUSES = new Set([
  "rider_assigned",
  "picked_up",
  "out_for_delivery",
  "arrived",
]);

export function normalizeOrderStatus(status?: string | null) {
  return status?.trim().toLowerCase() || "pending";
}

export function getOrderProgressStage(status?: string | null) {
  const normalized = normalizeOrderStatus(status);
  if (normalized === "delivered") return 3;
  if (TRAVELLING_STATUSES.has(normalized)) return 2;
  if (PREPARING_STATUSES.has(normalized)) return 1;
  return 0;
}

export function getOrderStatusTone(status?: string | null) {
  const normalized = normalizeOrderStatus(status);
  if (normalized === "delivered") return "success" as const;
  if (["cancelled", "rejected", "failed"].includes(normalized)) {
    return "danger" as const;
  }
  if (["pending", "scheduled"].includes(normalized)) return "warning" as const;
  return "active" as const;
}

export function getOrderStatusKey(status?: string | null) {
  const normalized = normalizeOrderStatus(status);
  const known = new Set([
    "scheduled",
    "pending",
    "accepted",
    "preparing",
    "ready",
    "rider_assigned",
    "picked_up",
    "out_for_delivery",
    "arrived",
    "delivered",
    "cancelled",
    "rejected",
    "failed",
  ]);
  return known.has(normalized) ? normalized : "unknown";
}

export function getOrderCode(order: OrderDetail) {
  const code = order.orderCode?.trim();
  if (code) return code.startsWith("#") ? code : `#${code}`;
  return `#${order.orderId.slice(0, 8).toUpperCase()}`;
}

export function hasAmount(value?: number | null) {
  return typeof value === "number" && Math.abs(value) > 0;
}
