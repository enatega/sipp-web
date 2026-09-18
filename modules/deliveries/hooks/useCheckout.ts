"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { checkoutApi } from "../api/checkout";
import { deliveryQueryKeys } from "../queries/queryKeys";
import type { CheckoutPreviewInput, PlaceOrderInput } from "../types/checkout";

export function useCheckoutPreview(input: CheckoutPreviewInput | null) {
  return useQuery({
    queryKey: deliveryQueryKeys.checkoutPreview(input),
    queryFn: ({ signal }) => checkoutApi.preview(input!, signal),
    enabled: Boolean(input),
    staleTime: 10_000,
    retry: 1,
  });
}

export function useCheckoutSchedule(storeId: string | null, enabled: boolean) {
  return useQuery({
    queryKey: deliveryQueryKeys.checkoutSchedule(storeId),
    queryFn: ({ signal }) => checkoutApi.schedule(storeId!, signal),
    enabled: Boolean(storeId) && enabled,
    staleTime: 60_000,
  });
}

export function useStripeOrderStatus(
  draftId: string | null,
  enabled: boolean,
) {
  return useQuery({
    queryKey: deliveryQueryKeys.stripeOrderStatus(draftId),
    queryFn: ({ signal }) => checkoutApi.stripeOrderStatus(draftId!, signal),
    enabled: Boolean(draftId) && enabled,
    staleTime: 0,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === "finalized" ||
        status === "payment_failed" ||
        status === "cancelled"
        ? false
        : 1_000;
    },
    retry: 2,
  });
}

export function useValidateCheckoutAddressMutation() {
  return useMutation({
    mutationFn: (input: CheckoutPreviewInput) => checkoutApi.preview(input),
  });
}

export function usePlaceOrderMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: PlaceOrderInput) => checkoutApi.placeOrder(input),
    onSuccess: async (response) => {
      if (response.mode === "wallet") {
        await queryClient.invalidateQueries({ queryKey: deliveryQueryKeys.cart() });
      }
    },
  });
}
