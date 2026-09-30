import type { DiscoveryLocation } from "./discovery";

export type RestaurantLocation = DiscoveryLocation;

export interface RestaurantCategory {
  id: string;
  name: string;
  imageUrl: string | null;
  subcategoryIds: string[];
}

export interface RestaurantSubcategory {
  id: string;
  name: string;
  imageUrl: string | null;
}

export interface RestaurantStore {
  id: string;
  name: string;
  address: string | null;
  logo: string | null;
  coverImage: string | null;
  averageRating: number;
  reviewCount: number;
  deliveryTime: string | number | null;
  distanceKm: number | null;
  baseFee: number;
  shopTypeName: string;
  tagLine: string | null;
  description: string | null;
  isAvailable: boolean;
  isFavorited: boolean;
  categories: RestaurantCategory[];
  subcategories: RestaurantSubcategory[];
}

export interface ProductDeal {
  discountedPrice: number;
  discountType: "percentage" | "fixed";
  discountValue: number;
  name: string | null;
}

export interface RestaurantProduct {
  id: string;
  name: string;
  nameTranslations: Record<string, string>;
  shortDescription: string | null;
  description: string | null;
  price: number;
  imageUrl: string | null;
  categoryId: string;
  subcategoryId: string | null;
  category: { id: string; name: string } | null;
  subcategory: { id: string; name: string } | null;
  deal: ProductDeal | null;
}

export interface RestaurantProductsPage {
  items: RestaurantProduct[];
  offset: number;
  limit: number;
  total: number;
  isEnd: boolean;
}

export interface ProductCustomizationOption {
  optionId: string;
  title: string;
  description: string | null;
  price: number;
}

export interface ProductCustomizationSection {
  groupId: string;
  name: string;
  description: string | null;
  type: string;
  minSelect: number;
  maxSelect: number | null;
  required: boolean;
  selectionType: "single" | "multiple";
  helperText: string | null;
  options: ProductCustomizationOption[];
}

export interface ProductInfo {
  productId: string;
  storeId: string;
  name: string;
  nameTranslations: Record<string, string>;
  imageUrl: string | null;
  description: string | null;
  price: number;
  averageRating: number;
  reviewCount: number;
  inStock: boolean;
  deal: ProductDeal | null;
}

export interface ProductCustomizations {
  variations: ProductCustomizationSection[];
  addons: ProductCustomizationSection[];
}

export interface RestaurantProductsInput {
  storeId: string;
  location: RestaurantLocation;
  search?: string;
  categoryId?: string;
  subcategoryId?: string;
  offset?: number;
  limit?: number;
}
