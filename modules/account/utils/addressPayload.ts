import type { AddressPayload } from "@/modules/account/api/location";
import type { AddressType, ChosenPlace } from "@/modules/account/types";

export type AddressFormValues = { type: AddressType; placeName: string; howToFindYou: string; deliveryInstructions: string };
export function buildAddressPayload(place: ChosenPlace, details: AddressFormValues, expectedUpdatedAt?: string): AddressPayload {
  return {
    address: place.address, latitude: place.latitude, longitude: place.longitude, type: details.type,
    addressDetailsVersion: 2, expectedUpdatedAt,
    additional_fields: {
      placeName: details.placeName.trim() || null,
      howToFindYou: details.howToFindYou.trim(),
      deliveryInstructions: details.deliveryInstructions.trim() || null,
    },
  };
}
