"use client";

import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSelectedDeliveryPlace } from "@/modules/account";
import { discoveryApi } from "@/modules/deliveries/api/discovery";
import { restaurantApi } from "@/modules/deliveries/api/restaurant";
import { deliveryQueryKeys } from "@/modules/deliveries/queries/queryKeys";
import type {
  DeliveryShopType,
  DiscoveryLocation,
} from "@/modules/deliveries/types/discovery";

const DISCOVERY_STALE_TIME = 5 * 60_000;

export function useHomeLayoutQuery() {
  return useQuery({
    queryKey: deliveryQueryKeys.homeLayout(),
    queryFn: ({ signal }) => discoveryApi.homeLayout(signal),
    staleTime: 60_000,
    refetchOnWindowFocus: true,
  });
}

export function useDeliveryCoverageQuery(location: DiscoveryLocation | null, enabled: boolean) {
  return useQuery({
    queryKey: [...deliveryQueryKeys.discovery(), "coverage", location],
    queryFn: ({ signal }) => discoveryApi.coverage(location!, signal),
    enabled: enabled && Boolean(location),
    staleTime: DISCOVERY_STALE_TIME,
  });
}

export function useDiscoveryLocation(isAuthenticated: boolean) {
  const { place, isReady } = useSelectedDeliveryPlace(isAuthenticated);
  const location: DiscoveryLocation | null = place
    ? { latitude: place.latitude, longitude: place.longitude }
    : null;
  return { location, isLocationReady: isReady };
}

export function useShopTypesQuery(enabled: boolean, home = false) {
  return useQuery({
    queryKey: [...deliveryQueryKeys.shopTypes(), home],
    queryFn: ({ signal }) => discoveryApi.shopTypes(signal, home),
    enabled,
    staleTime: DISCOVERY_STALE_TIME,
  });
}

export function useBannersQuery(enabled: boolean, home = false) {
  return useQuery({
    queryKey: [...deliveryQueryKeys.banners(), home],
    queryFn: ({ signal }) => discoveryApi.banners(signal, home),
    enabled,
    staleTime: DISCOVERY_STALE_TIME,
  });
}

export function useTopBrandsQuery(
  location: DiscoveryLocation | null,
  enabled: boolean,
  home = false,
) {
  return useQuery({
    queryKey: [...deliveryQueryKeys.topBrands(location), home],
    queryFn: ({ signal }) => discoveryApi.topBrands(location, signal, home),
    enabled: enabled && Boolean(location),
    staleTime: DISCOVERY_STALE_TIME,
  });
}

export function useNearbyStoresQuery(
  location: DiscoveryLocation | null,
  enabled: boolean,
  home = false,
) {
  return useQuery({
    queryKey: [...deliveryQueryKeys.nearbyStores(location), home],
    queryFn: ({ signal }) => discoveryApi.nearbyStores(location!, signal, home),
    enabled: enabled && Boolean(location),
    staleTime: DISCOVERY_STALE_TIME,
  });
}

export function useDealsQuery(enabled: boolean, home = false, location: DiscoveryLocation | null = null) {
  return useQuery({
    queryKey: [...deliveryQueryKeys.deals(), home, location],
    queryFn: ({ signal }) => discoveryApi.deals(location, signal, home),
    enabled: enabled && Boolean(location),
    staleTime: DISCOVERY_STALE_TIME,
  });
}

export function useShopTypeStoreQueries(
  shopTypes: Pick<DeliveryShopType, 'id'>[],
  location: DiscoveryLocation | null,
  enabled: boolean,
  home = false,
) {
  return useQueries({
    queries: shopTypes.map((shopType) => ({
      queryKey: [...deliveryQueryKeys.shopTypeStores(shopType.id, location), home],
      queryFn: ({ signal }: { signal: AbortSignal }) =>
        discoveryApi.shopTypeStores(shopType.id, location, signal, home),
      enabled: enabled && Boolean(shopType.id) && Boolean(location),
      staleTime: DISCOVERY_STALE_TIME,
    })),
  });
}

export function useOrderAgainQuery(enabled: boolean, customerId?: string | null) {
  return useQuery({
    queryKey: [...deliveryQueryKeys.orderAgain(), customerId ?? 'guest'],
    queryFn: ({ signal }) => discoveryApi.orderAgain(signal),
    enabled,
    staleTime: 60_000,
  });
}

/**
 * Toggles a store favourite from a discovery card. Stays pending until the
 * store lists refetch, so the card can show the next state without a flicker.
 */
export function useToggleStoreFavourite(storeId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => restaurantApi.toggleFavourite(storeId),
    onSuccess: () => {
      void Promise.all([
        queryClient.invalidateQueries({ queryKey: deliveryQueryKeys.discovery() }),
        queryClient.invalidateQueries({ queryKey: [...deliveryQueryKeys.all, "search"] }),
        queryClient.invalidateQueries({ queryKey: ["favourites"] }),
      ]);
    },
  });
}
