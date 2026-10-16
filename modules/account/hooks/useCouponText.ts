"use client";

import { useFormatter, useTranslations } from "next-intl";
import { useAppCurrencyFormatter } from "@/lib/useAppCurrency";
import { ApiError } from "@/services/api/client";
import type { ClaimedCoupon, CouponDeliveryType, CouponIssue, CouponIssueCode, CouponPaymentMethod } from "@/modules/account/types/coupons";

const ISSUE_CODES = new Set<CouponIssueCode>([
  "COUPON_INACTIVE",
  "COUPON_EXPIRED",
  "COUPON_MIN_ORDER",
  "COUPON_STORE",
  "COUPON_PRODUCTS",
  "COUPON_ORDER_TYPE",
  "COUPON_PAYMENT_METHOD",
  "COUPON_PREMIUM_ONLY",
  "COUPON_NEW_USERS_ONLY",
  "COUPON_USAGE_LIMIT",
  "COUPON_USER_LIMIT",
  "STORE_MINIMUM_AFTER_COUPON",
]);

type CouponRules = Partial<Pick<ClaimedCoupon, "min_order_value" | "payment_method" | "delivery_type" | "usage_per_user">>;

function isIssueCode(code: unknown): code is CouponIssueCode {
  return typeof code === "string" && ISSUE_CODES.has(code as CouponIssueCode);
}

function numberDetail(details: Record<string, unknown> | undefined, key: string) {
  const value = Number(details?.[key]);
  return Number.isFinite(value) ? value : null;
}

function listDetail<T extends string>(details: Record<string, unknown> | undefined, key: string): T[] | null {
  const value = details?.[key];
  return Array.isArray(value) ? value.filter((item): item is T => typeof item === "string") : null;
}

/** Translated coupon requirements and refusal reasons shared by Offers and checkout. */
export function useCouponText() {
  const t = useTranslations("coupons");
  const format = useFormatter();
  const formatAppCurrency = useAppCurrencyFormatter();
  const money = (value: number) => formatAppCurrency(format, value);

  function paymentMethods(methods: CouponPaymentMethod[] | undefined) {
    const known = (methods ?? []).filter((method): method is "CARD" | "WALLET" => method === "CARD" || method === "WALLET");
    if (!known.length || known.length === 2) return t("paymentMethods.any");
    return format.list(known.map((method) => t(`paymentMethods.${method}`)), { type: "disjunction" });
  }

  function deliveryTypes(types: CouponDeliveryType[] | undefined) {
    const values = types ?? [];
    if (!values.length || values.includes("ALL") || (values.includes("DELIVERY") && values.includes("PICKUP"))) return t("deliveryTypes.ALL");
    return format.list(values.map((type) => t(`deliveryTypes.${type}`)), { type: "disjunction" });
  }

  function issueMessage(issue: CouponIssue, coupon?: CouponRules | null) {
    if (!isIssueCode(issue.code)) return t("notApplicable");
    const details = issue.details;
    switch (issue.code) {
      case "COUPON_MIN_ORDER":
        return t("issues.COUPON_MIN_ORDER", { amount: money(numberDetail(details, "minOrderValue") ?? coupon?.min_order_value ?? 0) });
      case "COUPON_ORDER_TYPE":
        return t("issues.COUPON_ORDER_TYPE", { types: deliveryTypes(listDetail<CouponDeliveryType>(details, "deliveryTypes") ?? coupon?.delivery_type) });
      case "COUPON_PAYMENT_METHOD":
        return t("issues.COUPON_PAYMENT_METHOD", { methods: paymentMethods(listDetail<CouponPaymentMethod>(details, "paymentMethods") ?? coupon?.payment_method) });
      case "COUPON_USER_LIMIT":
        return t("issues.COUPON_USER_LIMIT", { count: numberDetail(details, "usagePerUser") ?? coupon?.usage_per_user ?? 1 });
      case "STORE_MINIMUM_AFTER_COUPON": {
        const minimum = numberDetail(details, "storeMinimumOrder") ?? 0;
        const total = numberDetail(details, "discountedSubtotal") ?? 0;
        return t("issues.STORE_MINIMUM_AFTER_COUPON", { total: money(total), minimum: money(minimum), remaining: money(Math.max(0, minimum - total)) });
      }
      default:
        return t(`issues.${issue.code}`);
    }
  }

  /** Reads a coupon refusal from an API error; null when the error is not a coupon rule. */
  function errorIssue(error: unknown): CouponIssue | null {
    return error instanceof ApiError && isIssueCode(error.code) ? { code: error.code } : null;
  }

  return { paymentMethods, deliveryTypes, issueMessage, errorIssue };
}
