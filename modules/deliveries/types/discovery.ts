export interface DiscoveryLocation {
  latitude: number;
  longitude: number;
}

export interface DeliveryShopType {
  id: string;
  name: string;
  slug?: string;
  description?: string | null;
  image?: string | null;
  icon?: string | null;
}

export interface DeliveryTopBrand {
  storeId?: string;
  vendorId?: string;
  name: string;
  logo?: string | null;
  deal?: string | null;
  dealType?: string | null;
  dealAmount?: number | null;
}

export interface DeliveryStore {
  storeId: string;
  vendorId: string;
  name: string;
  logo?: string | null;
  coverImage?: string | null;
  address?: string | null;
  shopTypeId?: string | null;
  shopTypeName?: string | null;
  averageRating?: number | null;
  reviewCount?: number | null;
  deliveryTime?: number | string | null;
  minimumOrder?: number | null;
  baseFee?: number | null;
  distanceKm?: number | null;
  latitude?: number | null;
  longitude?: number | null;
  isAvailable?: boolean;
  isOpen?: boolean;
  deal?: string | null;
  dealType?: string | null;
  dealAmount?: number | null;
  isFavorite?: boolean;
}

export type DeliveryBannerActionType = "store" | "product" | "shop_type" | "all_restaurants";

export interface DeliveryBanner {
  id: string;
  title: string;
  description?: string | null;
  bannerVideoLink?: string | null;
  bannerImageLink?: string | null;
  actionType?: DeliveryBannerActionType | null;
  relatedStore?: string | null;
  relatedProduct?: string | null;
  relatedShopType?: string | null;
  store?: {
    id: string;
    address?: string | null;
    storeImage?: string | null;
    coverImage?: string | null;
    isAvailable?: boolean;
    isOpen?: boolean;
  } | null;
  product?: {
    id: string;
    name?: string | null;
    imageUrl?: string | null;
    storeId?: string | null;
  } | null;
  shopType?: {
    id: string;
    name?: string | null;
    image?: string | null;
  } | null;
}

/** A product the customer has ordered before, most recent first. */
export interface DeliveryOrderAgainProduct {
  productId: string;
  storeId: string;
  name: string;
  nameTranslations: Record<string, string>;
  storeName: string;
  imageUrl: string | null;
  storeImage: string | null;
  storeLogo: string | null;
  price: number;
  discountedPrice: number | null;
  inStock: boolean;
}

export interface DiscoveryListParams {
  limit?: number;
  offset?: number;
}

export interface DiscoveryScrollPage<T> {
  items: T[];
  total: number;
  offset: number;
  limit: number;
  nextOffset: number | null;
  isEnd: boolean;
}

export type DiscoverySort = "recommended" | "delivery_price" | "rating" | "delivery_time" | "name";
export type DiscoveryStock = "all" | "instock" | "outofstock";
export type DiscoveryPriceTier = "$" | "$$" | "$$$" | "$$$$";

export interface DiscoveryBrowseParams {
  offset: number;
  search?: string;
  stock?: DiscoveryStock;
  priceTiers?: DiscoveryPriceTier[];
  sortBy?: DiscoverySort;
  shopTypeId?: string;
  location?: DiscoveryLocation | null;
}
