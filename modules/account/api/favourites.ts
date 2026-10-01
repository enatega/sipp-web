import { apiRoutes } from "@/config/api";
import { requestJson } from "@/services/api/client";

export type FavouriteStore = {
  storeId: string;
  slug: string;
  name: string;
  logo?: string | null;
  coverImage?: string | null;
  address?: string | null;
  shopTypeName?: string | null;
  deliveryTime?: string | number | null;
  averageRating?: number | null;
  reviewCount?: number | null;
  isOpen?: boolean;
  distanceKm?: number | null;
};

export type FavouritesResponse = { items: FavouriteStore[]; total: number };

export const favouritesApi = {
  list: () => requestJson<FavouritesResponse>(`${apiRoutes.favourites}?offset=0&limit=50`, { cache: "no-store" }),
  toggle: (storeId: string) => requestJson(`${apiRoutes.favourites}`, { method: "POST", body: JSON.stringify({ storeId }) }),
};
