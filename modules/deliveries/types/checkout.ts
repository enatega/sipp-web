export type CheckoutOrderType = "delivery" | "pickup";
export type CheckoutPaymentMethod = "wallet" | "stripe";

export interface CheckoutPreviewInput {
  storeId: string;
  bucketId: string;
  orderType: CheckoutOrderType;
  paymentMethod: CheckoutPaymentMethod;
  addressId?: string;
  deliveryAddress?: string;
  deliveryLatitude?: number;
  deliveryLongitude?: number;
  deliveryLabel?: string;
  scheduledAt?: string;
  riderTip?: number;
}

export interface CheckoutPreview {
  store: {
    id: string;
    name: string;
    address: string | null;
    image: string | null;
    logo: string | null;
    pickupAllowed: boolean;
    deliveryAllowed: boolean;
    scheduleAllowed: boolean;
    codAllowed: boolean;
    stripeAllowed: boolean;
  };
  fulfillment: {
    orderType: CheckoutOrderType;
    pickup: { address: string | null; latitude: number | null; longitude: number | null } | null;
    delivery: { addressId: string | null; label: string | null; address: string; latitude: number; longitude: number } | null;
  };
  schedule: { isScheduled: boolean; scheduledAt: string | null; scheduleAllowed: boolean };
  pricing: {
    subtotal: number;
    discount: number;
    tax: number;
    packingCharges: number;
    deliveryFee: number;
    riderTip: number;
    totalAmount: number;
  };
  bucket: { itemCount: number; items: unknown[] };
  /** First applied coupon; kept for single-coupon clients. */
  coupon?: CheckoutPreviewCoupon | null;
  /** Every coupon on the cart, in the order the customer applied them. */
  coupons?: CheckoutPreviewCoupon[];
}

export interface CheckoutPreviewCoupon {
  id: string;
  code: string;
  name?: string;
  isApplied: boolean;
  /** What this coupon took off the total; 0 when not applied. */
  appliedDiscount?: number;
  /** Why the server left the coupon out of this priced total. */
  issue?: { code: string; message: string; details: Record<string, unknown> } | null;
  requirements?: {
    paymentMethods: Array<"CARD" | "WALLET">;
    deliveryTypes: Array<"ALL" | "DELIVERY" | "PICKUP">;
    minOrderValue: number;
  };
}

export interface CheckoutScheduleSlot {
  start: string;
  end: string;
  isAvailable?: boolean;
  isOpen?: boolean;
}

export interface CheckoutScheduleDay {
  date: string;
  label: string;
  dayName: string;
  isActive: boolean;
  hasSlots: boolean;
  slots: CheckoutScheduleSlot[];
}

export interface CheckoutScheduleResponse {
  allowScheduleBooking: boolean;
  selectedDate: string;
  days: CheckoutScheduleDay[];
  slots: CheckoutScheduleSlot[];
}

export interface PlaceOrderInput extends CheckoutPreviewInput {
  paymentMethodId?: string;
  customerNote?: string;
  successUrl?: string;
  cancelUrl?: string;
}

export interface StripeOrderDraftStatus {
  draftId: string;
  status: string;
  orderId: string | null;
  checkoutUrl?: string;
  clientSecret?: string;
  paymentQuote?: StripePaymentQuote;
}

export interface StripePaymentQuote {
  businessCurrencyCode: string;
  businessCurrencySymbol: string;
  businessAmount: number;
  localCurrencyUnitsPerUsd: number;
  paymentCurrency: "USD";
  paymentAmount: number;
  paymentAmountMinor: number;
}

export type PlaceOrderResponse =
  | { mode: "wallet"; orderId: string; status: string; paymentStatus: string; paymentMethod: "wallet"; orderType: CheckoutOrderType; totalAmount: number; scheduledAt: string | null; createdAt: string }
  | { mode: "stripe"; draftId: string; orderId: string; paymentStatus: string; clientSecret?: never; checkoutUrl?: never }
  | { mode: "stripe"; draftId: string; clientSecret: string; paymentIntentId: string; paymentStatus: string; paymentQuote: StripePaymentQuote; orderId?: never; checkoutUrl?: never }
  | { mode: "stripe"; draftId: string; checkoutUrl: string; paymentStatus: string; paymentQuote?: StripePaymentQuote; orderId?: never; clientSecret?: never };
