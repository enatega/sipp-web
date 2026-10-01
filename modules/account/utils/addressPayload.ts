import type { AddressPayload } from "@/modules/account/api/location";
import type { AddressType, ChosenPlace } from "@/modules/account/types";

type AddressDetails = {
  type: AddressType;
  houseNo: string;
  building: string;
  landmark: string;
  /** Custom name; only used for "Other" addresses. */
  locationName?: string;
};

/** Builds the save/update payload shared by every address form. */
export function buildAddressPayload(
  place: ChosenPlace,
  details: AddressDetails,
): AddressPayload {
  const customName =
    details.type === "OTHER" ? details.locationName?.trim() : undefined;
  const locationName = customName || place.label;

  return {
    address: place.address,
    latitude: place.latitude,
    longitude: place.longitude,
    type: details.type,
    ...(locationName ? { location_name: locationName } : {}),
    additional_fields: {
      ...(details.houseNo.trim() ? { houseNo: details.houseNo.trim() } : {}),
      ...(details.building.trim() ? { building: details.building.trim() } : {}),
      ...(details.landmark.trim() ? { landmark: details.landmark.trim() } : {}),
    },
  };
}
