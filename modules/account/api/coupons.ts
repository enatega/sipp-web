import { apiRoutes } from "@/config/api";
import { postJson, requestJson } from "@/services/api/client";
import type { ClaimCouponResponse, ClaimedCouponsResponse } from "@/modules/account/types/coupons";

export const couponsApi = {
  claimed(offset = 0, limit = 12, signal?: AbortSignal) {
    const query = new URLSearchParams({ offset: String(offset), limit: String(limit) });
    return requestJson<ClaimedCouponsResponse>(`${apiRoutes.profileCoupons}?${query}`, {
      signal,
      cache: "no-store",
    });
  },
  claim(code: string) {
    return postJson<ClaimCouponResponse>(apiRoutes.profileCoupons, { code });
  },
  setActive(id: string, isActive: boolean) {
    return postJson<{ success: boolean; message: string }>(
      `${apiRoutes.profileCoupons}/${encodeURIComponent(id)}`,
      { isActive },
    );
  },
};
