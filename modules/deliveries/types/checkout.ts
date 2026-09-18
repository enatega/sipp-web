export type CheckoutOrderType = "delivery" | "pickup";
export type CheckoutPaymentMethod = "wallet" | "stripe";

export interface CheckoutPreviewInput {
  storeId: string;
  bucketId: string;
  orderType: CheckoutOrderType;
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
  paymentMethod: CheckoutPaymentMethod;
  paymentMethodId?: string;
  customerNote?: string;
  successUrl?: string;
  cancelUrl?: string;
}

export interface StripeOrderDraftStatus {
  draftId: string;
  status: string;
  orderId: string | null;
}

export type PlaceOrderResponse =
  | { mode: "wallet"; orderId: string; status: string; paymentStatus: string; paymentMethod: "wallet"; orderType: CheckoutOrderType; totalAmount: number; scheduledAt: string | null; createdAt: string }
  | { mode: "stripe"; draftId: string; clientSecret: string; paymentIntentId: string; paymentStatus: string };
