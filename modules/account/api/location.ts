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
  async savedAddresses() {
    const addresses: SavedAddress[] = [];
    let offset = 0;
    while (true) {
      const page = await requestJson<SavedAddressPage | SavedAddress[]>(`${apiRoutes.address}?offset=${offset}`, { cache: "no-store" });
      if (Array.isArray(page)) return page;
      addresses.push(...page.items);
      if (page.isEnd || !page.items.length) return addresses;
      offset += page.items.length;
    }
  },
  getAddress(id: string) { return requestJson<SavedAddress>(`${apiRoutes.address}/${encodeURIComponent(id)}`, { cache: "no-store" }); },
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
  additional_fields?: Record<string, string | null>;
  addressDetailsVersion?: 2;
  expectedUpdatedAt?: string;
};

let memoryPlace: ChosenPlace | null = null;

const STORAGE_KEY = "shaaneiol-location";

export function readStoredPlace(): ChosenPlace | null {
  try {
    if (memoryPlace) return memoryPlace;
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ChosenPlace) : null;
  } catch {
    return null;
  }
}

export function storePlace(place: ChosenPlace | null) {
  memoryPlace = place;
  try {
    if (place) window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ address: place.address, latitude: place.latitude, longitude: place.longitude, label: place.label, savedAddressId: place.savedAddressId }));
    else window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Storage can be blocked without preventing location selection.
  }
  window.dispatchEvent(new Event("shaaneiol-location-change"));
}
