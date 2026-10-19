import { apiRoutes } from "@/config/api";
import { requestJson } from "@/services/api/client";
import type { CheckoutPreview, CheckoutPreviewInput, CheckoutScheduleResponse, PlaceOrderInput, PlaceOrderResponse, StripeOrderDraftStatus } from "../types/checkout";

export const checkoutApi = {
  preview(input: CheckoutPreviewInput, signal?: AbortSignal) {
    return requestJson<CheckoutPreview>(`${apiRoutes.deliveryCheckout}/preview`, { method: "POST", body: JSON.stringify(input), signal, cache: "no-store" });
  },
  schedule(storeId: string, signal?: AbortSignal) {
    const query = new URLSearchParams({ days: "5", slotMinutes: "60" });
    return requestJson<CheckoutScheduleResponse>(`${apiRoutes.deliveryCheckout}/schedule/${encodeURIComponent(storeId)}?${query}`, { signal, cache: "no-store" });
  },
  placeOrder(input: PlaceOrderInput) {
    return requestJson<PlaceOrderResponse>(apiRoutes.deliveryCheckout, { method: "POST", body: JSON.stringify(input), timeoutMs: 65_000 });
  },
  placedOrderByBucket(input: { bucketId: string; storeId: string }, signal?: AbortSignal) {
    const query = new URLSearchParams({ bucketId: input.bucketId, storeId: input.storeId });
    return requestJson<{ orderId: string | null; draftId: string | null }>(`${apiRoutes.deliveryCheckout}?${query}`, { signal, cache: "no-store", timeoutMs: 5_000 });
  },
  stripeOrderStatus(draftId: string, signal?: AbortSignal) {
    return requestJson<StripeOrderDraftStatus>(
      `${apiRoutes.deliveryCheckout}/stripe/drafts/${encodeURIComponent(draftId)}`,
      { signal, cache: "no-store" },
    );
  },
};
