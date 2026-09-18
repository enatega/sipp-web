"use client";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import type { InfiniteData } from "@tanstack/react-query";
import { searchApi } from "@/modules/deliveries/api/search";
import { deliveryQueryKeys } from "@/modules/deliveries/queries/queryKeys";
import type { DiscoveryLocation } from "@/modules/deliveries/types/discovery";
import type { SearchPage, SearchParams, SearchProduct, SearchStore } from "@/modules/deliveries/types/search";

const RECOMMENDATIONS_STALE_TIME = 5 * 60_000;

function useDeliverySearchQuery<T>(
  resource: "products" | "stores",
  query: string,
  location: DiscoveryLocation | null,
  fetcher: (params: SearchParams, signal?: AbortSignal) => Promise<SearchPage<T>>,
) {
  return useInfiniteQuery<
    SearchPage<T>,
    Error,
    InfiniteData<SearchPage<T>>,
    ReturnType<typeof deliveryQueryKeys.search>,
    number
  >({
    queryKey: deliveryQueryKeys.search(resource, query, location),
    queryFn: ({ pageParam, signal }) =>
      fetcher({ query, offset: pageParam, location: location! }, signal),
    initialPageParam: 0,
    getNextPageParam: (page) => page.isEnd ? undefined : (page.nextOffset ?? undefined),
    enabled: query.length > 0 && Boolean(location),
    staleTime: 2 * 60_000,
  });
}

export function useProductSearchQuery(query: string, location: DiscoveryLocation | null) {
  return useDeliverySearchQuery<SearchProduct>("products", query, location, searchApi.products);
}

export function useStoreSearchQuery(query: string, location: DiscoveryLocation | null) {
  return useDeliverySearchQuery<SearchStore>("stores", query, location, searchApi.stores);
}

export function useSearchRecommendationsQuery() {
  return useQuery({
    queryKey: deliveryQueryKeys.searchRecommendations(),
    queryFn: ({ signal }) => searchApi.recommendations(10, signal),
    staleTime: RECOMMENDATIONS_STALE_TIME,
  });
}

export function useRecentSearchesQuery(enabled: boolean) {
  return useQuery({
    queryKey: deliveryQueryKeys.recentSearches(),
    queryFn: ({ signal }) => searchApi.recentSearches.list(signal),
    enabled,
  });
}
