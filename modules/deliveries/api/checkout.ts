import { apiRoutes } from "@/config/api";
import { requestJson } from "@/services/api/client";
import type { CheckoutPreview, CheckoutPreviewInput, CheckoutScheduleResponse, PlaceOrderInput, PlaceOrderResponse, StripeOrderDraftStatus } from "../types/checkout";

function previewQuery(input: CheckoutPreviewInput) {
  const query = new URLSearchParams({ storeId: input.storeId, bucketId: input.bucketId, orderType: input.orderType, paymentMethod: input.paymentMethod });
  if (input.addressId) query.set("addressId", input.addressId);
  if (input.deliveryAddress) query.set("deliveryAddress", input.deliveryAddress);
  if (input.deliveryLatitude !== undefined) query.set("deliveryLatitude", String(input.deliveryLatitude));
  if (input.deliveryLongitude !== undefined) query.set("deliveryLongitude", String(input.deliveryLongitude));
  if (input.deliveryLabel) query.set("deliveryLabel", input.deliveryLabel);
  if (input.scheduledAt) query.set("scheduledAt", input.scheduledAt);
  if (input.riderTip && input.riderTip > 0) query.set("riderTip", String(input.riderTip));
  return query;
}

export const checkoutApi = {
  preview(input: CheckoutPreviewInput, signal?: AbortSignal) {
    return requestJson<CheckoutPreview>(`${apiRoutes.deliveryCheckout}/preview?${previewQuery(input)}`, { signal, cache: "no-store" });
  },
  schedule(storeId: string, signal?: AbortSignal) {
    const query = new URLSearchParams({ days: "5", slotMinutes: "60" });
    return requestJson<CheckoutScheduleResponse>(`${apiRoutes.deliveryCheckout}/schedule/${encodeURIComponent(storeId)}?${query}`, { signal, cache: "no-store" });
  },
  placeOrder(input: PlaceOrderInput) {
    return requestJson<PlaceOrderResponse>(apiRoutes.deliveryCheckout, { method: "POST", body: JSON.stringify(input) });
  },
  stripeOrderStatus(draftId: string, signal?: AbortSignal) {
    return requestJson<StripeOrderDraftStatus>(
      `${apiRoutes.deliveryCheckout}/stripe/drafts/${encodeURIComponent(draftId)}`,
      { signal, cache: "no-store" },
    );
  },
};
