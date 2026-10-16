"use client";

import { useAddressesQuery } from "../queries/useAccountQueries";
import type { ChosenPlace } from "../types";
import { useStoredPlace } from "./useStoredPlace";

/** Keep the header and address-dependent requests on the same location. */
export function useSelectedDeliveryPlace(isAuthenticated: boolean) {
  const stored = useStoredPlace();
  const storedPlace =
    stored.place &&
    Number.isFinite(stored.place.latitude) &&
    Number.isFinite(stored.place.longitude)
      ? stored.place
      : null;
  const addresses = useAddressesQuery(isAuthenticated && stored.isReady && !storedPlace);
  const selectedAddress = addresses.data?.find((address) => address.is_selected);
  const [longitude, latitude] = selectedAddress?.location?.coordinates ?? [];
  const savedPlace: ChosenPlace | null =
    selectedAddress &&
    typeof latitude === "number" &&
    typeof longitude === "number" &&
    Number.isFinite(latitude) &&
    Number.isFinite(longitude)
      ? {
          address: selectedAddress.address,
          latitude,
          longitude,
          label: selectedAddress.address.split(",")[0] || selectedAddress.location_name || undefined,
          savedAddressId: selectedAddress.id,
        }
      : null;
  return {
    place: storedPlace ?? savedPlace,
    isReady: stored.isReady && (!isAuthenticated || Boolean(storedPlace) || !addresses.isPending),
  };
}
