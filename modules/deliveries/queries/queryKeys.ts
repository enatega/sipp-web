import type { DiscoveryLocation } from "@/modules/deliveries/types/discovery";
import type { RestaurantLocation } from "@/modules/deliveries/types/restaurant";
import type { CheckoutPreviewInput } from "@/modules/deliveries/types/checkout";

export const deliveryQueryKeys = {
  all: ["deliveries"] as const,
  support: (userId: string) => [...deliveryQueryKeys.all, "support", userId] as const,
  supportTickets: (userId: string) => [...deliveryQueryKeys.support(userId), "tickets"] as const,
  supportThread: (userId: string, id: string) => [...deliveryQueryKeys.support(userId), "thread", id] as const,
  supportOptions: () => [...deliveryQueryKeys.all, "support-options"] as const,
  discovery: () => [...deliveryQueryKeys.all, "discovery"] as const,
  homeLayout: () => [...deliveryQueryKeys.discovery(), "home-layout"] as const,
  shopTypes: () => [...deliveryQueryKeys.discovery(), "shop-types"] as const,
  banners: () => [...deliveryQueryKeys.discovery(), "banners"] as const,
  topBrands: (location: DiscoveryLocation | null) =>
    [...deliveryQueryKeys.discovery(), "top-brands", location] as const,
  nearbyStores: (location: DiscoveryLocation | null) =>
    [...deliveryQueryKeys.discovery(), "nearby-stores", location] as const,
  deals: () => [...deliveryQueryKeys.discovery(), "deals"] as const,
  shopTypeStores: (shopTypeId: string, location: DiscoveryLocation | null) =>
    [
      ...deliveryQueryKeys.discovery(),
      "shop-type-stores",
      shopTypeId,
      location,
    ] as const,
  orderAgain: () => [...deliveryQueryKeys.discovery(), "order-again"] as const,
  search: (resource: "products" | "stores", query: string, location: DiscoveryLocation | null) =>
    [...deliveryQueryKeys.all, "search", resource, query, location] as const,
  searchRecommendations: () => [...deliveryQueryKeys.all, "search", "recommendations"] as const,
  recentSearches: () => [...deliveryQueryKeys.all, "search", "recent-searches"] as const,
  orders: () => [...deliveryQueryKeys.all, "orders"] as const,
  orderList: (tab: "active" | "past" | "scheduled") =>
    [...deliveryQueryKeys.orders(), "list", tab] as const,
  order: (orderId: string) =>
    [...deliveryQueryKeys.orders(), "detail", orderId] as const,
  orderReview: (orderId: string) =>
    [...deliveryQueryKeys.order(orderId), "review"] as const,
  route: (origin: string, destination: string) =>
    [...deliveryQueryKeys.all, "route", origin, destination] as const,
  restaurant: (storeId: string, location: RestaurantLocation | null) =>
    [...deliveryQueryKeys.all, "restaurant", storeId, location] as const,
  restaurantProducts: (
    storeId: string,
    location: RestaurantLocation | null,
    search: string,
  ) =>
    [
      ...deliveryQueryKeys.restaurant(storeId, location),
      "products",
      search,
    ] as const,
  productInfo: (productId: string | null) =>
    [...deliveryQueryKeys.all, "product", productId, "info"] as const,
  productCustomizations: (productId: string | null) =>
    [...deliveryQueryKeys.all, "product", productId, "customizations"] as const,
  cart: () => [...deliveryQueryKeys.all, "cart"] as const,
  checkout: () => [...deliveryQueryKeys.all, "checkout"] as const,
  checkoutPreview: (input: CheckoutPreviewInput | null) =>
    [...deliveryQueryKeys.checkout(), "preview", input] as const,
  checkoutSchedule: (storeId: string | null) =>
    [...deliveryQueryKeys.checkout(), "schedule", storeId] as const,
  stripeOrderStatus: (draftId: string | null) =>
    [...deliveryQueryKeys.checkout(), "stripe-order-status", draftId] as const,
};
