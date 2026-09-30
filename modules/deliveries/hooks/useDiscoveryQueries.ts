"use client";

import { useEffect, useState } from "react";
import { useQueries, useQuery } from "@tanstack/react-query";
import { readStoredPlace, useAddressesQuery } from "@/modules/account";
import { discoveryApi } from "@/modules/deliveries/api/discovery";
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

export function useDiscoveryLocation(isAuthenticated: boolean) {
  const [location, setLocation] = useState<DiscoveryLocation | null>(null);
  const [isStoredLocationReady, setIsStoredLocationReady] = useState(false);
  const addresses = useAddressesQuery(isAuthenticated);

  useEffect(() => {
    const sync = () => {
      const place = readStoredPlace();
      setLocation(
        place
          ? { latitude: place.latitude, longitude: place.longitude }
          : null,
      );
      setIsStoredLocationReady(true);
    };
    sync();
    window.addEventListener("shaaneiol-location-change", sync);
    return () => window.removeEventListener("shaaneiol-location-change", sync);
  }, []);

  const selectedAddress = addresses.data?.find((address) => address.is_selected);
  const [savedLongitude, savedLatitude] =
    selectedAddress?.location?.coordinates ?? [];
  const selectedAddressLocation =
    typeof savedLatitude === "number" &&
    typeof savedLongitude === "number" &&
    Number.isFinite(savedLatitude) &&
    Number.isFinite(savedLongitude)
      ? { latitude: savedLatitude, longitude: savedLongitude }
      : null;
  const resolvedLocation = location ?? selectedAddressLocation;
  const isLocationReady =
    isStoredLocationReady &&
    (Boolean(location) || !isAuthenticated || !addresses.isPending);

  return { location: resolvedLocation, isLocationReady };
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
    enabled,
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
    enabled,
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
      enabled: enabled && Boolean(shopType.id),
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
