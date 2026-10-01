import { requestJson } from "@/services/api/client";
import type { OrderChatThread, OrderChatUnread } from "../types/orderChat";

const chatPath = (orderId: string) => `/api/orders/${encodeURIComponent(orderId)}/chat`;

export const orderChatApi = {
  thread: (orderId: string, signal?: AbortSignal) =>
    requestJson<OrderChatThread>(chatPath(orderId), { signal }),
  unread: (signal?: AbortSignal) =>
    requestJson<OrderChatUnread>("/api/orders/chat-unread", { signal }),
  send: (orderId: string, text: string) =>
    requestJson(chatPath(orderId), { method: "POST", body: JSON.stringify({ text }) }),
  markRead: (orderId: string) =>
    requestJson(chatPath(orderId), { method: "PATCH" }),
};
