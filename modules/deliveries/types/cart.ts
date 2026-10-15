export interface CartSelectionInput {
  groupId: string;
  optionId: string;
}

export interface AddCartItemInput {
  productId: string;
  quantity?: number;
  selectedOptions?: CartSelectionInput[];
  latitude?: number;
  longitude?: number;
}

export interface CartSelectedOption {
  groupId: string;
  groupName: string;
  optionId: string;
  optionName: string;
  price: number;
}

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  quantity: number;
  basePrice: number;
  unitPrice: number;
  lineTotal: number;
  selectedOptions: CartSelectedOption[];
  storeId: string;
  inStock: boolean;
  availableQuantity: number | null;
  inventoryIssue: "out_of_stock" | "insufficient_stock" | null;
}

export interface CartResponse {
  bucketId: string | null;
  customerId: string;
  status: string;
  storeId: string | null;
  minimumOrder: number;
  totalItems: number;
  uniqueItems: number;
  totalPrice: number;
  discountAmount: number;
  finalPrice: number;
  /** Sum of item lines (product deals included, coupons never); coupons are priced at checkout. */
  itemsTotal: number;
  appliedCouponId: string | null;
  appliedCouponCode: string | null;
  /** Every coupon applied to the cart, in the order it was applied. */
  appliedCouponIds: string[];
  isEmpty: boolean;
  pricesUpdated?: boolean;
  items: CartItem[];
}
