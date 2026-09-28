import { apiRoutes } from "@/config/api";
import { requestJson } from "@/services/api/client";
import type { InboxNotification, NotificationInboxPage } from "@/modules/account/types/notifications";

type JsonRecord = Record<string, unknown>;

function parsePage(value: unknown): NotificationInboxPage {
  const source = value && typeof value === "object" ? value as JsonRecord : {};
  const rawItems = Array.isArray(source.items) ? source.items : [];
  const items = rawItems.flatMap((value): InboxNotification[] => {
    const item = value && typeof value === "object" ? value as JsonRecord : null;
    if (!item || typeof item.id !== "string" || typeof item.title !== "string" || typeof item.description !== "string" || typeof item.createdAt !== "string") return [];
    const rawLink = typeof item.deep_link === "string" ? item.deep_link : "";
    const href = /^\/orders\/[0-9a-f-]{36}$/i.test(rawLink) ? rawLink : null;
    return [{ id: item.id, title: item.title, description: item.description, createdAt: item.createdAt, isRead: item.isRead === true, href }];
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
