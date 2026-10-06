import { apiRoutes } from "@/config/api";
import { requestJson } from "@/services/api/client";
import type { DeliveryFavouriteFood, DiscoveryLocation, DiscoveryScrollPage } from "@/modules/deliveries/types/discovery";
import type { SearchProduct } from "@/modules/deliveries/types/search";
import { parseDiscoveryPage } from "@/modules/deliveries/utils/discoveryMappers";

function record(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

function translations(value: unknown): Record<string, string> {
  return Object.fromEntries(
    Object.entries(record(value) ?? {}).filter(
      (entry): entry is [string, string] => typeof entry[1] === "string",
    ),
  );
}

function parseFoods(payload: unknown): DeliveryFavouriteFood[] {
  if (!Array.isArray(payload)) throw new Error("Invalid Favourite Foods response.");
  return payload.flatMap((value) => {
    const food = record(value);
    if (typeof food?.id !== "string" || typeof food.name !== "string") return [];
    return [{
      id: food.id,
      name: food.name,
      nameTranslations: translations(food.nameTranslations),
      imageUrl: typeof food.imageUrl === "string" ? food.imageUrl : null,
      shopTypeIds: Array.isArray(food.shopTypeIds)
        ? food.shopTypeIds.filter((id): id is string => typeof id === "string")
        : [],
    }];
  });
}

function parseProducts(payload: unknown): SearchProduct[] {
  const items = Array.isArray(payload) ? payload : record(payload)?.items;
  if (!Array.isArray(items)) return [];
  return items.flatMap((value) => {
    const item = record(value);
    if (typeof item?.productId !== "string" || typeof item.storeId !== "string") return [];
    const price = Number(item.price);
    return [{
      productId: item.productId,
      storeId: item.storeId,
      storeSlug: item.storeId,
      productName: typeof item.productName === "string" ? item.productName : "",
      productNameTranslations: translations(item.productNameTranslations),
      storeName: typeof item.storeName === "string" ? item.storeName : "",
      productImage: typeof item.productImage === "string" ? item.productImage : null,
      storeLogo: typeof item.storeLogo === "string" ? item.storeLogo : null,
      storeImage: typeof item.storeImage === "string" ? item.storeImage : null,
      price: Number.isFinite(price) ? price : 0,
    }];
  });
}

export const favouriteFoodsApi = {
  async list(signal?: AbortSignal): Promise<DeliveryFavouriteFood[]> {
    const payload = await requestJson<unknown>(apiRoutes.discovery.favouriteFoods, { signal });
    return parseFoods(payload);
  },
  async products(
    foodId: string,
    offset: number,
    location: DiscoveryLocation | null,
    shopTypeId: string | null,
    signal?: AbortSignal,
  ): Promise<DiscoveryScrollPage<SearchProduct>> {
    const query = new URLSearchParams({ offset: String(offset), limit: "12" });
    if (location) {
      query.set("latitude", String(location.latitude));
      query.set("longitude", String(location.longitude));
    }
    if (shopTypeId) query.set("shop_type_id", shopTypeId);
    const payload = await requestJson<unknown>(
      `${apiRoutes.discovery.favouriteFoods}/${encodeURIComponent(foodId)}/products?${query}`,
      { cache: "no-store", signal },
    );
    return parseDiscoveryPage(payload, parseProducts);
  },
};
