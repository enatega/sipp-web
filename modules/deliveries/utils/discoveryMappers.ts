import type {
  DeliveryBanner,
  DeliveryBannerActionType,
  DeliveryOrderAgainOrder,
  DeliveryShopType,
  DeliveryStore,
  DeliveryTopBrand,
} from "@/modules/deliveries/types/discovery";

type JsonRecord = Record<string, unknown>;

function record(value: unknown): JsonRecord | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as JsonRecord)
    : null;
}

function requiredString(value: unknown) {
  return typeof value === "string" && value.trim() ? value : null;
}

function optionalString(value: unknown) {
  return typeof value === "string" ? value : null;
}

function optionalNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function optionalBoolean(value: unknown) {
  return typeof value === "boolean" ? value : undefined;
}

function stringArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function list(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  const payload = record(value);
  if (!payload) return [];
  if (Array.isArray(payload.items)) return payload.items;
  return Array.isArray(payload.data) ? payload.data : [];
}

export function parseShopTypes(value: unknown): DeliveryShopType[] {
  return list(value).flatMap((item) => {
    const source = record(item);
    const id = requiredString(source?.id);
    const name = requiredString(source?.name);
    if (!source || !id || !name) return [];
    return [{
      id,
      name,
      slug: optionalString(source.slug) ?? undefined,
      description: optionalString(source.description),
      image: optionalString(source.image),
      icon: optionalString(source.icon),
    }];
  });
}

export function parseStores(value: unknown): DeliveryStore[] {
  return list(value).flatMap((item) => {
    const source = record(item);
    const storeId = requiredString(source?.storeId);
    const name = requiredString(source?.name);
    if (!source || !storeId || !name) return [];
    return [{
      storeId,
      vendorId: optionalString(source.vendorId) ?? "",
      name,
      logo: optionalString(source.logo),
      coverImage: optionalString(source.coverImage),
      address: optionalString(source.address),
      shopTypeId: optionalString(source.shopTypeId),
      shopTypeName: optionalString(source.shopTypeName),
      averageRating: optionalNumber(source.averageRating),
      reviewCount: optionalNumber(source.reviewCount),
      deliveryTime:
        optionalNumber(source.deliveryTime) ?? optionalString(source.deliveryTime),
      minimumOrder: optionalNumber(source.minimumOrder),
      baseFee: optionalNumber(source.baseFee),
      distanceKm: optionalNumber(source.distanceKm),
      latitude: optionalNumber(source.latitude),
      longitude: optionalNumber(source.longitude),
      isAvailable: optionalBoolean(source.isAvailable),
      isOpen: optionalBoolean(source.isClosed) !== undefined ? source.isClosed === false : optionalBoolean(source.isOpen),
      deal: optionalString(source.deal),
      dealType: optionalString(source.dealType),
      dealAmount: optionalNumber(source.dealAmount),
      isFavorite: optionalBoolean(source.isFavorite),
    }];
  });
}

export function parseTopBrands(value: unknown): DeliveryTopBrand[] {
  return list(value).flatMap((item) => {
    const source = record(item);
    const name = requiredString(source?.name);
    if (!source || !name) return [];
    return [{
      storeId: optionalString(source.storeId) ?? undefined,
      vendorId: optionalString(source.vendorId) ?? undefined,
      name,
      logo: optionalString(source.logo),
      deal: optionalString(source.deal),
      dealType: optionalString(source.dealType),
      dealAmount: optionalNumber(source.dealAmount),
    }];
  });
}

function parseBannerRelation(value: unknown) {
  const source = record(value);
  const id = requiredString(source?.id);
  return source && id ? { source, id } : null;
}

export function parseBanners(value: unknown): DeliveryBanner[] {
  const actions = new Set<DeliveryBannerActionType>([
    "store",
    "product",
    "shop_type",
    "all_restaurants",
  ]);
  return list(value).flatMap((item) => {
    const source = record(item);
    const id = requiredString(source?.id);
    if (!source || !id) return [];
    const title = optionalString(source.title) ?? "";
    const action = optionalString(source.actionType);
    const store = parseBannerRelation(source.store);
    const product = parseBannerRelation(source.product);
    const shopType = parseBannerRelation(source.shopType);
    return [{
      id,
      title,
      description: optionalString(source.description),
      bannerVideoLink: optionalString(source.bannerVideoLink),
      bannerImageLink: optionalString(source.bannerImageLink),
      actionType: action && actions.has(action as DeliveryBannerActionType)
        ? (action as DeliveryBannerActionType)
        : null,
      relatedStore: optionalString(source.relatedStore),
      relatedProduct: optionalString(source.relatedProduct),
      relatedShopType: optionalString(source.relatedShopType),
      store: store ? {
        id: store.id,
        address: optionalString(store.source.address),
        storeImage: optionalString(store.source.storeImage),
        coverImage: optionalString(store.source.coverImage),
        isAvailable: optionalBoolean(store.source.isAvailable),
        isOpen: optionalBoolean(store.source.isClosed) !== undefined ? store.source.isClosed === false : optionalBoolean(store.source.isOpen),
      } : null,
      product: product ? {
        id: product.id,
        name: optionalString(product.source.name),
        imageUrl: optionalString(product.source.imageUrl),
        storeId: optionalString(product.source.storeId),
      } : null,
      shopType: shopType ? {
        id: shopType.id,
        name: optionalString(shopType.source.name),
        image: optionalString(shopType.source.image),
      } : null,
    }];
  });
}

export function parseOrderAgain(value: unknown): DeliveryOrderAgainOrder[] {
  return list(value).flatMap((item) => {
    const source = record(item);
    const orderId = requiredString(source?.orderId);
    const storeId = requiredString(source?.storeId);
    const storeName = requiredString(source?.storeName);
    const orderedAt = requiredString(source?.orderedAt);
    if (!source || !orderId || !storeId || !storeName || !orderedAt) return [];
    return [{
      orderId,
      storeId,
      storeName,
      storeAddress: optionalString(source.storeAddress),
      storeLogo: optionalString(source.storeLogo),
      storeImage: optionalString(source.storeImage),
      itemCount: optionalNumber(source.itemCount) ?? 0,
      totalQuantity: optionalNumber(source.totalQuantity) ?? 0,
      orderTotal: optionalNumber(source.orderTotal) ?? 0,
      orderedAt,
      itemNames: stringArray(source.itemNames),
      itemImages: stringArray(source.itemImages),
      averageRating: optionalNumber(source.averageRating),
      reviewCount: optionalNumber(source.reviewCount),
    }];
  });
}

export function decodeDisplayText(value: string) {
  let decoded = value;
  if (value.includes("%")) {
    try {
      decoded = decodeURIComponent(value);
    } catch {
      decoded = value;
    }
  }
  return decoded.replace(/%amp;|&amp;|&#38;/gi, "&");
}

export function parseDiscoveryPage<T>(value: unknown, parseItems: (value: unknown) => T[]) {
  const source = record(value) ?? {};
  const items = parseItems(value);
  const offset = optionalNumber(source.offset) ?? 0;
  const limit = optionalNumber(source.limit) ?? 12;
  const total = optionalNumber(source.total) ?? items.length;
  const nextOffset = optionalNumber(source.nextOffset);
  return {
    items,
    offset,
    limit,
    total,
    nextOffset,
    isEnd: source.isEnd === true || nextOffset === null,
  };
}
