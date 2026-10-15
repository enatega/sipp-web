export type CouponDiscountType = "PERCENTAGE" | "FIXED" | "FLAT" | "ALL";
export type CouponPaymentMethod = "CARD" | "WALLET" | "COD";
export type CouponDeliveryType = "ALL" | "DELIVERY" | "PICKUP";

/** Stable server reasons a coupon cannot be used (see sipp-server coupon-eligibility.error.ts). */
export type CouponIssueCode =
  | "COUPON_INACTIVE"
  | "COUPON_EXPIRED"
  | "COUPON_MIN_ORDER"
  | "COUPON_STORE"
  | "COUPON_PRODUCTS"
  | "COUPON_ORDER_TYPE"
  | "COUPON_PAYMENT_METHOD"
  | "COUPON_PREMIUM_ONLY"
  | "COUPON_NEW_USERS_ONLY"
  | "COUPON_USAGE_LIMIT"
  | "COUPON_USER_LIMIT"
  | "STORE_MINIMUM_AFTER_COUPON";

export interface CouponIssue {
  code: string;
  details?: Record<string, unknown>;
}

export interface ClaimedCoupon {
  id: string;
  code: string;
  name: string;
  description: string;
  discount_type: CouponDiscountType;
  discount_value: number;
  max_discount_cap: number | null;
  min_order_value: number;
  start_date: string;
  end_date: string;
  status: string;
  is_active: boolean;
  claimed_at: string;
  payment_method?: CouponPaymentMethod[];
  delivery_type?: CouponDeliveryType[];
  usage_per_user?: number;
  total_usage_limit?: number;
  user_usage_count?: number;
  total_usage_count?: number;
  offered_by: Array<{
    store_id: string;
    store_name: string;
    store_image: string | null;
    store_user_image: string | null;
  }> | null;
}

export interface ClaimedCouponsResponse {
  data: ClaimedCoupon[];
  total: number;
  offset: number;
  limit: number;
}

export interface ClaimCouponResponse {
  success: boolean;
  message: string;
  data: Pick<ClaimedCoupon, "id" | "code" | "name" | "description" | "discount_type" | "discount_value" | "max_discount_cap" | "min_order_value" | "start_date" | "end_date">;
}
