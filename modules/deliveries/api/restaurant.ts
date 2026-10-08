import { apiRoutes } from "@/config/api";
import { requestJson } from "@/services/api/client";
import {
  parseProductCustomizations,
  parseProductInfo,
  parseRestaurantProducts,
  parseRestaurantReviews,
  parseRestaurantStore,
} from "../utils/restaurantMappers";
import type { RestaurantLocation, RestaurantProductsInput, ReviewStar } from "../types/restaurant";

function locationQuery(location: RestaurantLocation) {
  return {
    latitude: String(location.latitude),
    longitude: String(location.longitude),
  };
}

export const restaurantApi = {
  async resolveSlug(slug: string, signal?: AbortSignal) {
    return requestJson<{ storeId: string; slug: string }>(
      `${apiRoutes.restaurants}/resolve/${encodeURIComponent(slug)}`,
      { signal },
    );
  },
  async detail(storeId: string, location: RestaurantLocation, signal?: AbortSignal) {
    const query = new URLSearchParams(locationQuery(location));
    const payload = await requestJson<unknown>(
      `${apiRoutes.restaurants}/${encodeURIComponent(storeId)}?${query}`,
      { signal },
    );
    return parseRestaurantStore(payload);
  },
  async products(input: RestaurantProductsInput, signal?: AbortSignal) {
    const query = new URLSearchParams({
      ...locationQuery(input.location),
      offset: String(input.offset ?? 0),
      limit: String(input.limit ?? 100),
    });
    if (input.search?.trim()) query.set("search", input.search.trim());
    if (input.categoryId) query.set("categoryId", input.categoryId);
    if (input.subcategoryId) query.set("subcategoryId", input.subcategoryId);
    const payload = await requestJson<unknown>(
      `${apiRoutes.restaurants}/${encodeURIComponent(input.storeId)}?${query}`,
      { signal },
    );
    return parseRestaurantProducts(payload);
  },
  async reviews(storeId: string, offset: number, rating: ReviewStar | null, signal?: AbortSignal) {
    const query = new URLSearchParams({ offset: String(offset), limit: "10" });
    if (rating) query.set("rating", String(rating));
    const payload = await requestJson<unknown>(
      `${apiRoutes.restaurants}/${encodeURIComponent(storeId)}/reviews?${query}`,
      { signal },
    );
    return parseRestaurantReviews(payload);
  },
  async productInfo(productId: string, signal?: AbortSignal) {
    const payload = await requestJson<unknown>(
      `${apiRoutes.deliveryProducts}/${encodeURIComponent(productId)}`,
      { signal },
    );
    return parseProductInfo(payload);
  },
  async productCustomizations(productId: string, signal?: AbortSignal) {
    const payload = await requestJson<unknown>(
      `${apiRoutes.deliveryProducts}/${encodeURIComponent(productId)}/customizations`,
      { signal },
    );
    return parseProductCustomizations(payload);
  },
  async toggleFavourite(storeId: string) {
    return requestJson<{ isFavorite: boolean; message: string }>(apiRoutes.favourites, {
      method: "POST",
      body: JSON.stringify({ storeId }),
    });
  },
};
