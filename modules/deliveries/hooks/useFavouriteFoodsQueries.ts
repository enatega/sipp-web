"use client";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { favouriteFoodsApi } from "@/modules/deliveries/api/favouriteFoods";
import { deliveryQueryKeys } from "@/modules/deliveries/queries/queryKeys";
import type { DiscoveryLocation } from "@/modules/deliveries/types/discovery";

export function useFavouriteFoodsQuery() {
  return useQuery({
    queryKey: deliveryQueryKeys.favouriteFoods(),
    queryFn: ({ signal }) => favouriteFoodsApi.list(signal),
    staleTime: 5 * 60_000,
  });
}

export function useFavouriteFoodProductsQuery(
  foodId: string,
  location: DiscoveryLocation | null,
  shopTypeId: string | null = null,
  enabled = true,
) {
  return useInfiniteQuery({
    queryKey: deliveryQueryKeys.favouriteFoodProducts(foodId, location, shopTypeId),
    queryFn: ({ pageParam, signal }) =>
      favouriteFoodsApi.products(foodId, pageParam, location, shopTypeId, signal),
    initialPageParam: 0,
    enabled: enabled && Boolean(foodId),
    getNextPageParam: (lastPage) =>
      lastPage.isEnd ? undefined : (lastPage.nextOffset ?? undefined),
  });
}
