import { apiRoutes } from "@/config/api";
import { requestJson } from "@/services/api/client";
import type {
  RecentSearchItem,
  SearchEvent,
  SearchPage,
  SearchParams,
  SearchProduct,
  SearchRecommendation,
} from "@/modules/deliveries/types/search";
import { parseStores } from "@/modules/deliveries/utils/discoveryMappers";

function record(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

function number(value: unknown, fallback = 0) {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function parsePage<T>(payload: unknown, items: (value: unknown) => T[]): SearchPage<T> {
  const source = record(payload);
  if (!source) throw new Error("Invalid search response.");
  const meta = record(source.searchMeta);
  const provider = meta?.provider === "algolia" ? "algolia" : "database";
  return {
    items: items(source.items),
    offset: number(source.offset),
    limit: number(source.limit, 12),
    total: number(source.total),
    nextOffset:
      typeof source.nextOffset === "number" || typeof source.nextOffset === "string"
        ? number(source.nextOffset)
        : null,
    isEnd: source.isEnd === true,
    searchMeta: {
      provider,
      ...(typeof meta?.queryId === "string" ? { queryId: meta.queryId } : {}),
    },
  };
}

function parseRecommendations(value: unknown): SearchRecommendation[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((entry) => {
    const item = record(entry);
    if (!item || typeof item.id !== "string" || typeof item.name !== "string") return [];
    return [{
      id: item.id,
      name: item.name,
      imageUrl: typeof item.imageUrl === "string" ? item.imageUrl : "",
    }];
  });
}

function parseRecentSearches(value: unknown): RecentSearchItem[] {
  const source = record(value);
  const items = source?.items;
  if (!Array.isArray(items)) return [];
  return items.flatMap((entry) => {
    const item = record(entry);
    if (!item || typeof item.id !== "string" || typeof item.term !== "string") return [];
    return [{ id: item.id, term: item.term }];
  });
}

function parseProducts(value: unknown): SearchProduct[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((entry) => {
    const item = record(entry);
    if (!item || typeof item.productId !== "string" || typeof item.storeId !== "string") return [];
    return [{
      productId: item.productId,
      storeId: item.storeId,
      storeSlug: typeof item.storeSlug === "string" ? item.storeSlug : item.storeId,
      productName: typeof item.productName === "string" ? item.productName : "",
      productNameTranslations: Object.fromEntries(
        Object.entries(record(item.productNameTranslations) ?? {}).filter(
          (entry): entry is [string, string] => typeof entry[1] === "string",
        ),
      ),
      storeName: typeof item.storeName === "string" ? item.storeName : "",
      productImage: typeof item.productImage === "string" ? item.productImage : null,
      storeLogo: typeof item.storeLogo === "string" ? item.storeLogo : null,
      storeImage: typeof item.storeImage === "string" ? item.storeImage : null,
      price: number(item.price),
      deal: typeof item.deal === "string" ? item.deal : null,
      dealType: typeof item.dealType === "string" ? item.dealType : null,
      dealAmount: item.dealAmount === null ? null : number(item.dealAmount),
    }];
  });
}

function query(params: SearchParams) {
  return new URLSearchParams({
    q: params.query,
    offset: String(params.offset),
    limit: "12",
    latitude: String(params.location.latitude),
    longitude: String(params.location.longitude),
  });
}

export const searchApi = {
  products(params: SearchParams, signal?: AbortSignal) {
    return requestJson<unknown>(
      `${apiRoutes.deliverySearch.products}?${query(params)}`,
      { cache: "no-store", signal },
    ).then((payload) => parsePage(payload, parseProducts));
  },
  stores(params: SearchParams, signal?: AbortSignal) {
    return requestJson<unknown>(
      `${apiRoutes.deliverySearch.stores}?${query(params)}`,
      { cache: "no-store", signal },
    ).then((payload) => parsePage(payload, parseStores));
  },
  event(payload: SearchEvent) {
    return requestJson<{ accepted: boolean }>(apiRoutes.deliverySearch.events, {
      method: "POST",
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });
  },
  recommendations(limit = 10, signal?: AbortSignal) {
    return requestJson<unknown>(
      `${apiRoutes.deliverySearch.recommendations}?limit=${limit}`,
      { cache: "no-store", signal },
    ).then(parseRecommendations);
  },
  recentSearches: {
    list(signal?: AbortSignal) {
      return requestJson<unknown>(
        `${apiRoutes.deliverySearch.recent}?limit=10`,
        { cache: "no-store", signal },
      ).then(parseRecentSearches);
    },
    save(term: string) {
      return requestJson<unknown>(apiRoutes.deliverySearch.recent, {
        method: "POST",
        body: JSON.stringify({ term }),
        cache: "no-store",
      });
    },
    remove(id: string) {
      return requestJson<{ deleted: boolean }>(`${apiRoutes.deliverySearch.recent}/${id}`, {
        method: "DELETE",
        cache: "no-store",
      });
    },
    clear() {
      return requestJson<{ cleared: boolean }>(apiRoutes.deliverySearch.recent, {
        method: "DELETE",
        cache: "no-store",
      });
    },
  },
};
