import type { DeliveryStore, DiscoveryLocation } from "./discovery";

export interface SearchMeta {
  provider: "algolia" | "database";
  queryId?: string;
}

export interface SearchProduct {
  productId: string;
  storeId: string;
  storeSlug: string;
  productName: string;
  productNameTranslations: Record<string, string>;
  storeName: string;
  productImage?: string | null;
  storeLogo?: string | null;
  storeImage?: string | null;
  price: number;
  deal?: string | null;
  dealType?: string | null;
  dealAmount?: number | null;
}

export interface SearchPage<T> {
  items: T[];
  offset: number;
  limit: number;
  total: number;
  nextOffset: number | null;
  isEnd: boolean;
  searchMeta?: SearchMeta;
}

export interface SearchParams {
  query: string;
  offset: number;
  limit?: number;
  location: DiscoveryLocation;
}

export type SearchStore = DeliveryStore;

export interface SearchEvent {
  eventType: "click" | "conversion";
  resourceType: "product" | "store";
  queryId: string;
  objectId: string;
  position?: number;
  eventName: "Product Opened" | "Store Opened" | "Product Ordered";
}

export interface SearchRecommendation {
  id: string;
  name: string;
  imageUrl: string;
}

export interface RecentSearchItem {
  id: string;
  term: string;
}
