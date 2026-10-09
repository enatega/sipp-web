import type {
  ProductCustomizationSection,
  ProductCustomizations,
  ProductDeal,
  ProductInfo,
  RestaurantCategory,
  RestaurantProduct,
  RestaurantProductsPage,
  RestaurantReview,
  RestaurantReviewsPage,
  RestaurantStore,
  RestaurantSubcategory,
  StoreOpeningHours,
} from "../types/restaurant";

type RecordValue = Record<string, unknown>;

function record(value: unknown): RecordValue {
  return value && typeof value === "object" ? (value as RecordValue) : {};
}

function text(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function optionalText(value: unknown) {
  const valueText = text(value).trim();
  return valueText ? valueText : null;
}

function stringRecord(value: unknown): Record<string, string> {
  return Object.fromEntries(
    Object.entries(record(value)).filter(
      (entry): entry is [string, string] =>
        typeof entry[1] === "string" && entry[1].trim().length > 0,
    ),
  );
}

function number(value: unknown, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function parseStoreTimings(value: unknown): RestaurantStore["storeTimings"] {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const result: NonNullable<RestaurantStore["storeTimings"]> = {};
  for (const [day, rawDay] of Object.entries(value)) {
    const entry = record(rawDay);
    result[day.toLowerCase()] = {
      is_active: entry.is_active === true,
      slots: Array.isArray(entry.slots) ? entry.slots.flatMap((rawSlot) => {
        const slot = record(rawSlot);
        const open = optionalText(slot.open);
        const close = optionalText(slot.close);
        return open && close ? [{ open, close }] : [];
      }) : [],
    };
  }
  return result;
}

function deal(value: unknown, price: number): ProductDeal | null {
  const source = record(value);
  const discountedPrice = number(source.discounted_price, Number.NaN);
  if (!Number.isFinite(discountedPrice)) return null;
  const discountValue = number(source.discount_value, Number.NaN);
  // Older payloads only carry the discounted price; treat the difference as
  // a fixed discount so variation prices still get the same saving.
  if (!Number.isFinite(discountValue)) {
    return {
      discountedPrice,
      discountType: "fixed",
      discountValue: Math.max(0, price - discountedPrice),
      name: optionalText(source.deal_name),
    };
  }
  return {
    discountedPrice,
    discountType: source.discount_type === "percentage" ? "percentage" : "fixed",
    discountValue,
    name: optionalText(source.deal_name),
  };
}

const TIME_PATTERN = /^\d{1,2}:\d{2}$/;

function parseOpeningHours(value: unknown): StoreOpeningHours | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const hours: StoreOpeningHours = {};
  for (const [day, raw] of Object.entries(value as Record<string, unknown>)) {
    const entry = record(raw);
    const slots = Array.isArray(entry.slots)
      ? entry.slots
        .map((slot) => record(slot))
        .filter((slot) => typeof slot.open === "string" && typeof slot.close === "string" && TIME_PATTERN.test(slot.open) && TIME_PATTERN.test(slot.close))
        .map((slot) => ({ open: String(slot.open), close: String(slot.close) }))
      : [];
    hours[day.toLowerCase()] = { isOpen: entry.is_active === true && slots.length > 0, slots };
  }
  return Object.keys(hours).length ? hours : null;
}

export function parseRestaurantStore(value: unknown): RestaurantStore {
  const source = record(value);
  const categories = Array.isArray(source.categories)
    ? source.categories.map((item): RestaurantCategory => {
      const category = record(item);
      return {
        id: text(category.id),
        name: text(category.name),
        imageUrl: optionalText(category.imageUrl),
        subcategoryIds: Array.isArray(category.subcategoryIds)
          ? category.subcategoryIds.filter(
            (id): id is string => typeof id === "string",
          )
          : [],
      };
    })
    : [];
  const subcategories = Array.isArray(source.subcategories)
    ? source.subcategories
      .map((item): RestaurantSubcategory => {
        const subcategory = record(item);
        return {
          id: text(subcategory.id),
          name: text(subcategory.name),
          imageUrl: optionalText(subcategory.imageUrl),
        };
      })
      .filter((subcategory) => subcategory.id)
    : [];

  return {
    id: text(source.id),
    slug: text(source.slug),
    name: text(source.name),
    address: optionalText(source.address),
    latitude: source.latitude == null ? null : number(source.latitude),
    longitude: source.longitude == null ? null : number(source.longitude),
    logo: optionalText(source.logo),
    coverImage: optionalText(source.coverImage),
    averageRating: number(source.averageRating),
    reviewCount: number(source.reviewCount),
    deliveryTime:
      typeof source.deliveryTime === "number"
        ? source.deliveryTime
        : optionalText(source.deliveryTime),
    distanceKm:
      source.distanceKm === null || source.distanceKm === undefined
        ? null
        : number(source.distanceKm),
    baseFee: number(source.baseFee),
    minimumOrder: number(source.minimumOrder),
    pickupAllowed: source.pickupAllowed == null ? null : source.pickupAllowed === true,
    deliveryAllowed: source.deliveryAllowed == null ? null : source.deliveryAllowed === true,
    contact: {
      email: optionalText(record(source.contact).email),
      phone: optionalText(record(source.contact).phone),
    },
    shopTypeName: text(source.shopTypeName),
    tagLine: optionalText(source.tagLine),
    description: optionalText(source.description),
    isAvailable: source.isAvailable !== false && source.isClosed !== true,
    openingHours: parseOpeningHours(source.storeTimings),
    isAdministrativelyAvailable: source.isAvailable !== false,
    timezone: optionalText(source.timezone),
    storeTimings: parseStoreTimings(source.storeTimings),
    isFavorited: source.isFavorited === true,
    categories,
    subcategories,
  };
}

function parseRestaurantProduct(value: unknown): RestaurantProduct {
  const source = record(value);
  const category = record(source.category);
  const categoryId = text(source.categoryId || category.id);
  const subcategory = record(source.subcategory);
  const subcategoryId = optionalText(source.subcategoryId || subcategory.id);
  return {
    id: text(source.id),
    name: text(source.name),
    nameTranslations: stringRecord(source.nameTranslations),
    shortDescription: optionalText(source.shortDescription),
    description: optionalText(source.description),
    price: number(source.price),
    inStock: source.inStock !== false,
    imageUrl: optionalText(source.imageUrl),
    categoryId,
    subcategoryId,
    category: categoryId
      ? { id: categoryId, name: text(category.name) }
      : null,
    subcategory: subcategoryId
      ? { id: subcategoryId, name: text(subcategory.name) }
      : null,
    deal: deal(source.deal, number(source.price)),
  };
}

export function parseRestaurantProducts(value: unknown): RestaurantProductsPage {
  const source = record(value);
  const items = Array.isArray(source.items)
    ? source.items.map(parseRestaurantProduct).filter((item) => item.id)
    : [];
  const offset = number(source.offset);
  const limit = Math.max(1, number(source.limit, 100));
  const total = number(source.total, items.length);
  return {
    items,
    offset,
    limit,
    total,
    isEnd: source.isEnd === true || offset + items.length >= total,
  };
}

export function parseProductInfo(value: unknown): ProductInfo {
  const source = record(value);
  return {
    productId: text(source.productId),
    storeId: text(source.storeId),
    name: text(source.name),
    nameTranslations: stringRecord(source.nameTranslations),
    imageUrl: optionalText(source.imageUrl),
    description: optionalText(source.description),
    price: number(source.price),
    averageRating: number(source.averageRating),
    reviewCount: number(source.reviewCount),
    inStock: source.inStock !== false,
    deal: deal(source.deal, number(source.price)),
  };
}

function parseSections(value: unknown): ProductCustomizationSection[] {
  return Array.isArray(value)
    ? value.map((item) => {
      const source = record(item);
      const selectionType = source.selectionType === "single" ? "single" : "multiple";
      return {
        groupId: text(source.groupId),
        name: text(source.name),
        description: optionalText(source.description),
        type: text(source.type),
        minSelect: number(source.minSelect),
        maxSelect:
          source.maxSelect === null || source.maxSelect === undefined
            ? null
            : number(source.maxSelect),
        required: source.required === true || number(source.minSelect) > 0,
        selectionType,
        helperText: optionalText(source.helperText),
        options: Array.isArray(source.options)
          ? source.options.map((optionValue) => {
            const option = record(optionValue);
            return {
              optionId: text(option.optionId),
              title: text(option.title),
              description: optionalText(option.description),
              price: number(option.price),
            };
          })
          : [],
      };
    })
    : [];
}

export function parseProductCustomizations(value: unknown): ProductCustomizations {
  const source = record(value);
  return {
    variations: parseSections(source.variations),
    addons: parseSections(source.addons),
  };
}

function parseRestaurantReview(value: unknown): RestaurantReview {
  const source = record(value);
  const reviewer = record(source.reviewer);
  return {
    id: text(source.id),
    rating: Math.min(5, Math.max(0, number(source.rating))),
    comment: optionalText(source.comment),
    createdAt: optionalText(source.createdAt),
    reviewer: { name: optionalText(reviewer.name), image: optionalText(reviewer.image) },
  };
}

export function parseRestaurantReviews(value: unknown): RestaurantReviewsPage {
  const source = record(value);
  const items = Array.isArray(source.items)
    ? source.items.map(parseRestaurantReview).filter((item) => item.id)
    : [];
  const offset = number(source.offset);
  const total = number(source.total, items.length);
  const distribution = record(source.distribution);
  return {
    items,
    offset,
    total,
    isEnd: offset + items.length >= total || items.length === 0,
    averageRating: number(source.averageRating),
    totalReviews: number(source.totalReviews, total),
    distribution: {
      1: number(distribution[1]),
      2: number(distribution[2]),
      3: number(distribution[3]),
      4: number(distribution[4]),
      5: number(distribution[5]),
    },
  };
}
