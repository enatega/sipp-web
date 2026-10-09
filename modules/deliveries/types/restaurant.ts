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

export interface StoreOpeningDay {
  isOpen: boolean;
  slots: { open: string; close: string }[];
}

export type StoreOpeningHours = Record<string, StoreOpeningDay>;

export interface RestaurantStore {
  id: string;
  slug: string;
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
  isAdministrativelyAvailable: boolean;
  timezone: string | null;
  storeTimings: Record<string, { is_active?: boolean; slots?: Array<{ open?: string; close?: string }> }> | null;
  isFavorited: boolean;
  /** Weekly opening hours in the store's local time, keyed by lowercase day name. */
  openingHours: StoreOpeningHours | null;
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
  inStock: boolean;
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

export type ReviewStar = 1 | 2 | 3 | 4 | 5;

export interface RestaurantReview {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string | null;
  reviewer: { name: string | null; image: string | null };
}

export interface RestaurantReviewsPage {
  items: RestaurantReview[];
  offset: number;
  total: number;
  isEnd: boolean;
  averageRating: number;
  totalReviews: number;
  distribution: Record<ReviewStar, number>;
}
