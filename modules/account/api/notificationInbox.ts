import { apiRoutes } from "@/config/api";
import { ApiError, requestJson } from "@/services/api/client";
import type { InboxNotification, NotificationInboxPage } from "@/modules/account/types/notifications";

type JsonRecord = Record<string, unknown>;

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function text(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function parsePage(value: unknown): NotificationInboxPage {
  // A malformed body must surface as a load failure, never as an empty inbox.
  if (!value || typeof value !== "object" || !Array.isArray((value as JsonRecord).items)) {
    throw new ApiError("Notifications returned an unexpected response.", 502, { code: "INVALID_RESPONSE" });
  }
  const source = value as JsonRecord;
  const rawItems = source.items as unknown[];
  const items = rawItems.flatMap((value): InboxNotification[] => {
    const item = value && typeof value === "object" ? value as JsonRecord : null;
    if (!item || typeof item.id !== "string" || typeof item.title !== "string" || !item.title.trim() || typeof item.description !== "string" || !item.description.trim() || typeof item.createdAt !== "string") return [];
    const rawLink = typeof item.deep_link === "string" ? item.deep_link : "";
    const href = /^\/orders\/[0-9a-f-]{36}$/i.test(rawLink) ? rawLink : null;
    const data = item.data && typeof item.data === "object" ? item.data as JsonRecord : {};
    const orderId = typeof data.orderId === "string" ? data.orderId : null;
    return [{
      id: item.id,
      title: item.title,
      description: item.description,
      createdAt: item.createdAt,
      isRead: item.isRead === true,
      href,
      type: typeof data.type === "string" ? data.type : null,
      orderId,
      // The backend's orderCode is the first segment of the order UUID, upper-cased.
      orderCode: orderId && UUID_PATTERN.test(orderId) ? `#${orderId.split("-")[0].toUpperCase()}` : null,
      storeName: text(item.storeName) ?? text(data.storeName),
      status: typeof data.status === "string" ? data.status : null,
    }];
  });
  const offset = typeof source.offset === "number" ? source.offset : 0;
  const limit = typeof source.limit === "number" ? source.limit : 10;
  const total = typeof source.total === "number" ? source.total : items.length;
  const nextOffset = typeof source.nextOffset === "number" ? source.nextOffset : null;
  return { items, offset, limit, total, nextOffset, isEnd: source.isEnd === true || nextOffset === null };
}

export const notificationInboxApi = {
  async list(period: "today" | "past", offset: number, signal?: AbortSignal) {
    const value = await requestJson<unknown>(`${apiRoutes.notifications}/${period}?offset=${offset}&limit=10`, { signal, cache: "no-store" });
    return parsePage(value);
  },
  markAllRead() {
    return requestJson<{ message: string }>(`${apiRoutes.notifications}/read-all`, { method: "PATCH" });
  },
  markRead(id: string) {
    return requestJson<{ message: string }>(`${apiRoutes.notifications}/read/${encodeURIComponent(id)}`, { method: "PATCH" });
  },
  unreadCount(signal?: AbortSignal) {
    return requestJson<{ unreadCount: number }>(`${apiRoutes.notifications}/unread-count`, { signal, cache: "no-store" });
  },
};
