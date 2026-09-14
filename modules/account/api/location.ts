import { apiRoutes } from "@/config/api";
import { postJson, requestJson } from "@/services/api/client";
import type {
  ChosenPlace,
  PlacePoint,
  Prediction,
  SavedAddress,
  SavedAddressPage,
} from "@/modules/account/types";

export const locationApi = {
  search(input: string, signal?: AbortSignal) {
    return requestJson<Prediction[]>(apiRoutes.maps.places, {
      method: "POST",
      body: JSON.stringify({ input }),
      signal,
    });
  },
  placeDetails(placeId: string) {
    return postJson<PlacePoint>(apiRoutes.maps.details, { placeId });
  },
  addressFromPoint(lat: number, lng: number) {
    return requestJson<{ address: string }>(
      `${apiRoutes.maps.reverse}?lat=${lat}&lng=${lng}`,
    );
  },
  savedAddresses() {
    return requestJson<SavedAddressPage | SavedAddress[]>(apiRoutes.address, {
      cache: "no-store",
    }).then((page) => (Array.isArray(page) ? page : page.items ?? []));
  },
  saveAddress(payload: AddressPayload) {
    return postJson<SavedAddress>(apiRoutes.address, payload);
  },
  updateAddress(id: string, payload: AddressPayload) {
    return requestJson<SavedAddress>(
      `${apiRoutes.address}/${encodeURIComponent(id)}`,
      { method: "PATCH", body: JSON.stringify(payload) },
    );
  },
  deleteAddress(id: string) {
    return requestJson<unknown>(
      `${apiRoutes.address}/${encodeURIComponent(id)}`,
      { method: "DELETE" },
    );
  },
  selectAddress(id: string) {
    return requestJson<SavedAddress>(
      `${apiRoutes.address}/${encodeURIComponent(id)}/select`,
      { method: "PATCH" },
    );
  },
};

export type AddressPayload = {
  address: string;
  latitude: number;
  longitude: number;
  type: string;
  location_name?: string;
  additional_fields?: Record<string, string>;
};

const STORAGE_KEY = "shaaneiol-location";

export function readStoredPlace(): ChosenPlace | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ChosenPlace) : null;
  } catch {
    return null;
  }
}

export function storePlace(place: ChosenPlace | null) {
  try {
    if (place) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(place));
    else window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Storage can be blocked without preventing location selection.
  }
  window.dispatchEvent(new Event("shaaneiol-location-change"));
}
