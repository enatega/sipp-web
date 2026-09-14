"use client";

import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { couponsApi } from "@/modules/account/api/coupons";
import { deliveryQueryKeys } from "@/modules/deliveries/queries/queryKeys";

const PAGE_SIZE = 12;
export const couponQueryKeys = {
  all: ["account", "coupons"] as const,
  claimed: () => [...couponQueryKeys.all, "claimed"] as const,
};

export function useClaimedCouponsQuery(enabled = true) {
  return useInfiniteQuery({
    queryKey: couponQueryKeys.claimed(),
    queryFn: ({ pageParam, signal }) => couponsApi.claimed(pageParam, PAGE_SIZE, signal),
    initialPageParam: 0,
    enabled,
    staleTime: 0,
    refetchOnMount: "always",
    getNextPageParam: (lastPage) => {
      const next = lastPage.offset + lastPage.data.length;
      return next < lastPage.total && lastPage.data.length > 0 ? next : undefined;
    },
  });
}

export function useClaimCouponMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (code: string) => couponsApi.claim(code),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: couponQueryKeys.all }),
  });
}

export function useCouponActivationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => couponsApi.setActive(id, isActive),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: couponQueryKeys.all }),
        queryClient.invalidateQueries({ queryKey: deliveryQueryKeys.cart() }),
        queryClient.invalidateQueries({ queryKey: deliveryQueryKeys.checkout() }),
      ]);
    },
  });
}
