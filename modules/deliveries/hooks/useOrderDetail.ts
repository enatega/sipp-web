"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ordersApi } from "../api/orders";
import { deliveryQueryKeys } from "../queries/queryKeys";
import type { ReviewInput } from "../types/orders";

const TERMINAL_STATUSES = new Set([
  "delivered",
  "cancelled",
  "rejected",
  "failed",
]);

export function useOrderDetailQuery(orderId: string) {
  return useQuery({
    queryKey: deliveryQueryKeys.order(orderId),
    queryFn: ({ signal }) => ordersApi.detail(orderId, signal),
    enabled: Boolean(orderId),
    refetchInterval: (query) =>
      TERMINAL_STATUSES.has(query.state.data?.status ?? "") ? false : 5_000,
    refetchIntervalInBackground: true,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: "always",
  });
}

export function useOrderReviewQuery(orderId: string, enabled: boolean) {
  return useQuery({
    queryKey: deliveryQueryKeys.orderReview(orderId),
    queryFn: ({ signal }) => ordersApi.reviewDetails(orderId, signal),
    enabled: Boolean(orderId) && enabled,
    staleTime: 30_000,
  });
}

export function useSubmitOrderReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ReviewInput) => ordersApi.review(input),
    onSuccess: (_, input) =>
      queryClient.invalidateQueries({
        queryKey: deliveryQueryKeys.orderReview(input.orderId),
      }),
  });
}
