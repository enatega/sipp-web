import { apiRoutes } from "@/config/api";
import { requestJson } from "@/services/api/client";
import type { OrderDetail, OrderReview, OrdersResponse, ReviewInput } from "../types/orders";
export const ordersApi = {
  list(tab: "active" | "past" | "scheduled", offset = 0, signal?: AbortSignal) {
    const suffix = tab === "active" ? "" : `/${tab}`;
    return requestJson<OrdersResponse>(`${apiRoutes.orders}${suffix}?offset=${offset}&limit=10`, { cache: "no-store", signal });
  },
  detail(id: string, signal?: AbortSignal) { return requestJson<OrderDetail>(`${apiRoutes.orders}/${id}`, { cache: "no-store", signal }); },
  cancel(id: string) { return requestJson<OrderDetail>(`${apiRoutes.orders}/${id}/cancel`, { method: "PUT" }); },
  review(payload: ReviewInput) { return requestJson(`${apiRoutes.orderReviews}`, { method: "POST", body: JSON.stringify(payload) }); },
  reviewDetails(orderId: string, signal?: AbortSignal) { return requestJson<OrderReview>(`${apiRoutes.orderReviews}/${orderId}`, { cache: "no-store", signal }); },
};
