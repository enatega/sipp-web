import { apiRoutes } from "@/config/api";
import { requestJson } from "@/services/api/client";
import type { DiscoveryBrowseParams, DiscoveryLocation } from "@/modules/deliveries/types/discovery";
import {
  parseBanners,
  parseDiscoveryPage,
  parseOrderAgain,
  parseShopTypes,
  parseStores,
  parseTopBrands,
} from "@/modules/deliveries/utils/discoveryMappers";

function withLocation(path: string, location: DiscoveryLocation | null) {
  const query = new URLSearchParams({ offset: "0", limit: "10" });
  if (location) {
    query.set("latitude", String(location.latitude));
    query.set("longitude", String(location.longitude));
  }
  return `${path}?${query.toString()}`;
}

function browseQuery(params: DiscoveryBrowseParams) {
  const query = new URLSearchParams({ offset: String(params.offset), limit: "12" });
  if (params.search) query.set("search", params.search);
  if (params.stock && params.stock !== "all") query.set("stock", params.stock);
  if (params.sortBy) query.set("sort_by", params.sortBy);
  if (params.shopTypeId) query.set("shop_type_id", params.shopTypeId);
  params.priceTiers?.forEach((tier) => query.append("price_tiers", tier));
  if (params.location) {
    query.set("latitude", String(params.location.latitude));
    query.set("longitude", String(params.location.longitude));
  }
  return query;
}

export const discoveryApi = {
  async homeLayout(signal?: AbortSignal): Promise<{ revision: number; sections: { key: string; kind: string; title: string }[] }> {
    return requestJson<{ revision: number; sections: { key: string; kind: string; title: string }[] }>(`${apiRoutes.discovery.home}`, { signal });
  },
  async shopTypes(signal?: AbortSignal, home = false) {
    const payload = await requestJson<unknown>(
      `${apiRoutes.discovery.shopTypes}?offset=0&limit=10${home ? '&home=true' : ''}`,
      { signal },
    );
    const items = parseShopTypes(payload);
    const source = payload && typeof payload === "object" && !Array.isArray(payload)
      ? payload as Record<string, unknown> : {};
    const parsedTotal = Number(source.total);
    return { items, total: Number.isSafeInteger(parsedTotal) && parsedTotal >= items.length ? parsedTotal : items.length };
  },
  async banners(signal?: AbortSignal, home = false) {
    const payload = await requestJson<unknown>(
      `${apiRoutes.discovery.banners}?offset=0&limit=10${home ? '&home=true' : ''}`,
      { signal },
    );
    return parseBanners(payload);
  },
  async topBrands(location: DiscoveryLocation | null, signal?: AbortSignal, home = false) {
    const payload = await requestJson<unknown>(
      `${withLocation(apiRoutes.discovery.topBrands, location)}${home ? '&home=true' : ''}`,
      { signal },
    );
    return parseTopBrands(payload);
  },
  async nearbyStores(location: DiscoveryLocation, signal?: AbortSignal, home = false) {
    const payload = await requestJson<unknown>(
      `${withLocation(apiRoutes.discovery.nearbyStores, location)}${home ? '&home=true' : ''}`,
      { signal },
    );
    return parseStores(payload);
  },
  async deals(location: DiscoveryLocation | null, signal?: AbortSignal, home = false) {
    const payload = await requestJson<unknown>(
      `${withLocation(apiRoutes.discovery.deals, location)}${home ? '&home=true' : ''}`,
      { signal },
    );
    return parseStores(payload);
  },
  async shopTypeStores(
    shopTypeId: string,
    location: DiscoveryLocation | null,
    signal?: AbortSignal,
    home = false,
  ) {
    const path = `${apiRoutes.discovery.shopTypes}/${encodeURIComponent(shopTypeId)}/stores`;
    const payload = await requestJson<unknown>(`${withLocation(path, location)}${home ? '&home=true' : ''}`, {
      signal,
    });
    return parseStores(payload);
  },
  async orderAgain(signal?: AbortSignal) {
    const payload = await requestJson<unknown>(
      `${apiRoutes.discovery.orderAgain}?offset=0&limit=10`,
      { signal },
    );
    return parseOrderAgain(payload);
  },
  async browseStores(source: "nearby" | "shop-type" | "deals", params: DiscoveryBrowseParams, signal?: AbortSignal) {
    const path = source === "nearby"
      ? apiRoutes.discovery.nearbyStores
      : source === "deals"
        ? apiRoutes.discovery.deals
        : `${apiRoutes.discovery.shopTypes}/${encodeURIComponent(params.shopTypeId ?? "")}/stores`;
    const payload = await requestJson<unknown>(`${path}?${browseQuery(params)}`, { signal, cache: "no-store" });
    return parseDiscoveryPage(payload, parseStores);
  },
  async browseShopTypes(offset: number, search: string, signal?: AbortSignal) {
    const query = new URLSearchParams({ offset: String(offset), limit: "20" });
    if (search) query.set("search", search);
    const payload = await requestJson<unknown>(`${apiRoutes.discovery.shopTypes}?${query}`, { signal, cache: "no-store" });
    return parseDiscoveryPage(payload, parseShopTypes);
  },
  async browseTopBrands(offset: number, search: string, location: DiscoveryLocation | null, signal?: AbortSignal) {
    const query = new URLSearchParams({ offset: String(offset), limit: "20" });
    if (search) query.set("search", search);
    if (location) { query.set("latitude", String(location.latitude)); query.set("longitude", String(location.longitude)); }
    const payload = await requestJson<unknown>(`${apiRoutes.discovery.topBrands}?${query}`, { signal, cache: "no-store" });
    return parseDiscoveryPage(payload, parseTopBrands);
  },
  async browseOrderAgain(offset: number, search: string, signal?: AbortSignal) {
    const query = new URLSearchParams({ offset: String(offset), limit: "12" });
    if (search) query.set("search", search);
    const payload = await requestJson<unknown>(`${apiRoutes.discovery.orderAgain}?${query}`, { signal, cache: "no-store" });
    return parseDiscoveryPage(payload, parseOrderAgain);
  },
};
