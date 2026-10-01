import type {
  DeliveryBanner,
  DeliveryBannerActionType,
  DeliveryOrderAgainProduct,
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
    const price = optionalNumber(source.price);
    const discountedPrice = optionalNumber(source.discountedPrice);
    return [{
      storeId,
      slug: optionalString(source.slug) ?? storeId,
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
      deliveryFee: optionalNumber(source.deliveryFee),
      distanceKm: optionalNumber(source.distanceKm),
      latitude: optionalNumber(source.latitude),
      longitude: optionalNumber(source.longitude),
      isAvailable: optionalBoolean(source.isAvailable),
      isOpen: optionalBoolean(source.isClosed) !== undefined ? source.isClosed === false : optionalBoolean(source.isOpen),
      deal: optionalString(source.deal),
      dealType: optionalString(source.dealType),
      dealAmount: optionalNumber(source.dealAmount),
      price,
      discountedPrice:
        price !== null && discountedPrice !== null && discountedPrice < price
          ? Math.max(0, discountedPrice)
          : null,
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
      slug: optionalString(source.slug) ?? undefined,
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

export function parseOrderAgain(value: unknown): DeliveryOrderAgainProduct[] {
  return list(value).flatMap((item) => {
    const source = record(item);
    const productId = requiredString(source?.productId);
    const storeId = requiredString(source?.storeId);
    const name = requiredString(source?.productName) ?? requiredString(source?.name);
    if (!source || !productId || !storeId || !name) return [];
    const price = optionalNumber(source.price) ?? 0;
    const discountedPrice = optionalNumber(record(source.deal)?.discounted_price);
    const translations = record(source.productNameTranslations) ?? {};
    return [{
      productId,
      storeId,
      name,
      nameTranslations: Object.fromEntries(
        Object.entries(translations).filter(
          (entry): entry is [string, string] => typeof entry[1] === "string",
        ),
      ),
      storeName: optionalString(source.storeName) ?? "",
      imageUrl: optionalString(source.productImage) ?? optionalString(source.imageUrl),
      storeImage: optionalString(source.storeImage),
      storeLogo: optionalString(source.storeLogo),
      price,
      discountedPrice:
        discountedPrice !== null && discountedPrice < price
          ? Math.max(0, discountedPrice)
          : null,
      inStock: optionalBoolean(source.inStock) ?? true,
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
