import type { CartItem, CartResponse, CartSelectedOption } from "../types/cart";

type UnknownRecord = Record<string, unknown>;

function record(value: unknown): UnknownRecord {
  return value && typeof value === "object" ? (value as UnknownRecord) : {};
}

function text(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function optionalText(value: unknown) {
  const normalized = text(value).trim();
  return normalized || null;
}

function number(value: unknown, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function parseOption(value: unknown): CartSelectedOption {
  const source = record(value);
  return {
    groupId: text(source.groupId),
    groupName: text(source.groupName),
    optionId: text(source.optionId),
    optionName: text(source.optionName),
    price: number(source.price),
  };
}

function parseItem(value: unknown): CartItem {
  const source = record(value);
  const quantity = Math.max(1, number(source.quantity, 1));
  const unitPrice = number(source.unitPrice);
  return {
    id: text(source.id),
    productId: text(source.productId),
    name: text(source.name),
    description: optionalText(source.description),
    imageUrl: optionalText(source.imageUrl),
    quantity,
    basePrice: number(source.basePrice),
    unitPrice,
    lineTotal: number(source.lineTotal, unitPrice * quantity),
    selectedOptions: Array.isArray(source.selectedOptions)
      ? source.selectedOptions.map(parseOption).filter((option) => option.optionId)
      : [],
    storeId: text(source.storeId),
    inStock: source.inStock !== false,
  };
}

export function parseCart(value: unknown): CartResponse {
  const source = record(value);
  const items = Array.isArray(source.items)
    ? source.items.map(parseItem).filter((item) => item.id)
    : [];
  const totalItems = number(
    source.totalItems,
    items.reduce((total, item) => total + item.quantity, 0),
  );
  return {
    bucketId: optionalText(source.bucketId),
    customerId: text(source.customerId),
    status: text(source.status),
    storeId: optionalText(source.storeId),
    totalItems,
    uniqueItems: number(source.uniqueItems, items.length),
    totalPrice: number(source.totalPrice),
    discountAmount: number(source.discountAmount),
    finalPrice: number(source.finalPrice),
    appliedCouponId: optionalText(source.appliedCouponId),
    appliedCouponCode: optionalText(source.appliedCouponCode),
    isEmpty: source.isEmpty === true || totalItems === 0 || items.length === 0,
    items,
  };
}

/**
 * TypeORM does not guarantee an order for the cart's eager item relation.
 * Keep the order the customer is already looking at after cart mutations and
 * append genuinely new lines at the end.
 */
export function preserveCartItemOrder(
  previous: CartResponse | undefined,
  next: CartResponse,
): CartResponse {
  if (!previous?.items.length || !next.items.length) return next;

  const nextItemsById = new Map(next.items.map((item) => [item.id, item]));
  const previousIds = new Set(previous.items.map((item) => item.id));
  const items = [
    ...previous.items.flatMap((item) => {
      const updatedItem = nextItemsById.get(item.id);
      return updatedItem ? [updatedItem] : [];
    }),
    ...next.items.filter((item) => !previousIds.has(item.id)),
  ];

  return { ...next, items };
}
