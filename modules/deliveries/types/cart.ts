export interface CartSelectionInput {
  groupId: string;
  optionId: string;
}

export interface AddCartItemInput {
  productId: string;
  quantity?: number;
  selectedOptions?: CartSelectionInput[];
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
}

export interface CartResponse {
  bucketId: string | null;
  customerId: string;
  status: string;
  storeId: string | null;
  totalItems: number;
  uniqueItems: number;
  totalPrice: number;
  discountAmount: number;
  finalPrice: number;
  appliedCouponId: string | null;
  appliedCouponCode: string | null;
  isEmpty: boolean;
  items: CartItem[];
}
