export type CouponDiscountType = "PERCENTAGE" | "FIXED" | "FLAT" | "ALL";

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
