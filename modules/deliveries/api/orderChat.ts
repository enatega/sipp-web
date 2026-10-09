import { requestJson } from "@/services/api/client";
import type { OrderChatThread, OrderChatUnread } from "../types/orderChat";

const chatPath = (orderId: string) => `/api/orders/${encodeURIComponent(orderId)}/chat`;

export const orderChatApi = {
  thread: (orderId: string, signal?: AbortSignal) =>
    requestJson<OrderChatThread>(chatPath(orderId), { signal }),
  unread: (signal?: AbortSignal) =>
    requestJson<OrderChatUnread>("/api/orders/chat-unread", { signal }),
  send: (orderId: string, text: string, attachmentUrls: string[] = []) =>
    requestJson(chatPath(orderId), { method: "POST", body: JSON.stringify({ text, attachmentUrls }) }),
  upload: async (orderId: string, file: File): Promise<{ url: string; mimeType: string }> => {
    const form = new FormData();
    form.set("file", file, file.name);
    return requestJson(`${chatPath(orderId)}/upload`, { method: "POST", body: form });
  },
  markRead: (orderId: string) =>
    requestJson(chatPath(orderId), { method: "PATCH" }),
};
