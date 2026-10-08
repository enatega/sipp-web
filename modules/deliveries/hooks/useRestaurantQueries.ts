"use client";

import { useEffect, useState } from "react";
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { readStoredPlace } from "@/modules/account";
import { restaurantApi } from "../api/restaurant";
import { deliveryQueryKeys } from "../queries/queryKeys";
import type { RestaurantLocation, RestaurantStore, ReviewStar } from "../types/restaurant";
export { useCartMutations, useCartQuery } from "./useCart";

const RESTAURANT_STALE_TIME = 2 * 60_000;

export function useRestaurantSlug(slug: string) {
  return useQuery({
    queryKey: [...deliveryQueryKeys.all, "restaurant-slug", slug] as const,
    queryFn: ({ signal }) => restaurantApi.resolveSlug(slug, signal),
    enabled: Boolean(slug),
    staleTime: RESTAURANT_STALE_TIME,
  });
}

export function useRestaurantLocation() {
  const [location, setLocation] = useState<RestaurantLocation | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const sync = () => {
      const place = readStoredPlace();
      setLocation(
        place
          ? { latitude: place.latitude, longitude: place.longitude }
          : null,
      );
      setIsReady(true);
    };
    sync();
    window.addEventListener("shaaneiol-location-change", sync);
    return () => window.removeEventListener("shaaneiol-location-change", sync);
  }, []);

  return { location, isReady };
}

export function useRestaurantQuery(
  storeId: string,
  location: RestaurantLocation | null,
) {
  return useQuery({
    queryKey: deliveryQueryKeys.restaurant(storeId, location),
    queryFn: ({ signal }) => restaurantApi.detail(storeId, location!, signal),
    enabled: Boolean(storeId && location),
    staleTime: RESTAURANT_STALE_TIME,
    refetchInterval: 30_000,
  });
}

export function useRestaurantProductsQuery(
  storeId: string,
  location: RestaurantLocation | null,
  search: string,
) {
  return useInfiniteQuery({
    queryKey: deliveryQueryKeys.restaurantProducts(storeId, location, search),
    queryFn: ({ pageParam, signal }) =>
      restaurantApi.products(
        {
          storeId,
          location: location!,
          search,
          offset: pageParam,
          limit: 100,
        },
        signal,
      ),
    initialPageParam: 0,
    getNextPageParam: (lastPage) =>
      lastPage.isEnd ? undefined : lastPage.offset + lastPage.items.length,
    enabled: Boolean(storeId && location),
    staleTime: RESTAURANT_STALE_TIME,
  });
}

export function useRestaurantReviewsQuery(
  storeId: string,
  rating: ReviewStar | null,
  enabled: boolean,
) {
  return useInfiniteQuery({
    queryKey: deliveryQueryKeys.restaurantReviews(storeId, rating),
    queryFn: ({ pageParam, signal }) =>
      restaurantApi.reviews(storeId, pageParam, rating, signal),
    initialPageParam: 0,
    getNextPageParam: (lastPage) =>
      lastPage.isEnd ? undefined : lastPage.offset + lastPage.items.length,
    enabled: Boolean(storeId) && enabled,
    staleTime: RESTAURANT_STALE_TIME,
  });
}

export function useProductConfiguration(productId: string | null) {
  const info = useQuery({
    queryKey: deliveryQueryKeys.productInfo(productId),
    queryFn: ({ signal }) => restaurantApi.productInfo(productId!, signal),
    enabled: Boolean(productId),
    staleTime: RESTAURANT_STALE_TIME,
  });
  const customizations = useQuery({
    queryKey: deliveryQueryKeys.productCustomizations(productId),
    queryFn: ({ signal }) =>
      restaurantApi.productCustomizations(productId!, signal),
    enabled: Boolean(productId),
    staleTime: RESTAURANT_STALE_TIME,
  });
  return { info, customizations };
}

export function useToggleRestaurantFavourite(
  storeId: string,
  location: RestaurantLocation | null,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => restaurantApi.toggleFavourite(storeId),
    onSuccess: (result) => {
      queryClient.setQueryData<RestaurantStore>(
        deliveryQueryKeys.restaurant(storeId, location),
        (current) => current ? { ...current, isFavorited: result.isFavorite } : current,
      );
      void queryClient.invalidateQueries({
        queryKey: deliveryQueryKeys.restaurant(storeId, location),
      });
    },
  });
}
