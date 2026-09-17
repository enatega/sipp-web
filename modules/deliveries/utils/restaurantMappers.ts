import type {
  ProductCustomizationSection,
  ProductCustomizations,
  ProductDeal,
  ProductInfo,
  RestaurantCategory,
  RestaurantProduct,
  RestaurantProductsPage,
  RestaurantStore,
  RestaurantSubcategory,
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

function number(value: unknown, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function deal(value: unknown): ProductDeal | null {
  const source = record(value);
  const discountedPrice = number(source.discounted_price, Number.NaN);
  return Number.isFinite(discountedPrice)
    ? { discountedPrice, name: optionalText(source.deal_name) }
    : null;
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
    name: text(source.name),
    address: optionalText(source.address),
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
    shopTypeName: text(source.shopTypeName),
    tagLine: optionalText(source.tagLine),
    description: optionalText(source.description),
    isAvailable: source.isAvailable !== false && source.isClosed !== true,
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
    shortDescription: optionalText(source.shortDescription),
    description: optionalText(source.description),
    price: number(source.price),
    imageUrl: optionalText(source.imageUrl),
    categoryId,
    subcategoryId,
    category: categoryId
      ? { id: categoryId, name: text(category.name) }
      : null,
    subcategory: subcategoryId
      ? { id: subcategoryId, name: text(subcategory.name) }
      : null,
    deal: deal(source.deal),
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
    imageUrl: optionalText(source.imageUrl),
    description: optionalText(source.description),
    price: number(source.price),
    averageRating: number(source.averageRating),
    reviewCount: number(source.reviewCount),
    inStock: source.inStock !== false,
    deal: deal(source.deal),
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
