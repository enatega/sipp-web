"use client";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import type { InfiniteData } from "@tanstack/react-query";
import { restaurantApi } from "@/modules/deliveries/api/restaurant";
import { searchApi } from "@/modules/deliveries/api/search";
import { deliveryQueryKeys } from "@/modules/deliveries/queries/queryKeys";
import type { DiscoveryLocation } from "@/modules/deliveries/types/discovery";
import type { SearchPage, SearchParams, SearchProduct, SearchStore } from "@/modules/deliveries/types/search";

const RECOMMENDATIONS_STALE_TIME = 5 * 60_000;
const RESULT_DETAILS_STALE_TIME = 2 * 60_000;

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

function useDeliverySearchPageQuery<T>(
  resource: "products" | "stores",
  query: string,
  location: DiscoveryLocation | null,
  page: number,
  fetcher: (params: SearchParams, signal?: AbortSignal) => Promise<SearchPage<T>>,
  enabled: boolean,
) {
  return useQuery<SearchPage<T>>({
    queryKey: deliveryQueryKeys.searchPage(resource, query, location, page),
    queryFn: ({ signal }) => fetcher({
      query,
      offset: (page - 1) * 12,
      limit: 12,
      location: location!,
    }, signal),
    enabled: enabled && query.length > 0 && Boolean(location),
    staleTime: 2 * 60_000,
  });
}

export function useProductSearchPageQuery(query: string, location: DiscoveryLocation | null, page: number, enabled = true) {
  return useDeliverySearchPageQuery("products", query, location, page, searchApi.products, enabled);
}

export function useStoreSearchPageQuery(query: string, location: DiscoveryLocation | null, page: number, enabled = true) {
  return useDeliverySearchPageQuery("stores", query, location, page, searchApi.stores, enabled);
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

// Product search results only carry names, prices and images; these load the
// store header and description for each result card without menu-page polling.
export function useSearchResultStoreQuery(storeId: string, location: DiscoveryLocation | null) {
  return useQuery({
    queryKey: deliveryQueryKeys.restaurant(storeId, location),
    queryFn: ({ signal }) => restaurantApi.detail(storeId, location!, signal),
    enabled: Boolean(storeId && location),
    staleTime: RESULT_DETAILS_STALE_TIME,
  });
}

export function useSearchResultProductQuery(productId: string) {
  return useQuery({
    queryKey: deliveryQueryKeys.productInfo(productId),
    queryFn: ({ signal }) => restaurantApi.productInfo(productId, signal),
    enabled: Boolean(productId),
    staleTime: RESULT_DETAILS_STALE_TIME,
  });
}
