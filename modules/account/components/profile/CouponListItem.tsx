"use client";

import { Bike, CircleAlert, CreditCard, LoaderCircle, Repeat, Store, Tag } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { useAppCurrencyFormatter } from "@/lib/useAppCurrency";
import { useCouponText } from "@/modules/account/hooks/useCouponText";
import type { ClaimedCoupon } from "@/modules/account/types/coupons";

interface Props {
  coupon: ClaimedCoupon;
  isBusy?: boolean;
  onToggle: (coupon: ClaimedCoupon) => void;
  compact?: boolean;
  /** Why this coupon cannot be applied right now. */
  disabledReason?: string;
  /** Why the applied coupon is not discounting this checkout. */
  issue?: string;
  /** Formatted amount this coupon takes off the current checkout. */
  savings?: string;
}

export function couponUsability(coupon: ClaimedCoupon) {
  const now = Date.now();
  if (coupon.status !== "active") return "unavailable" as const;
  if (new Date(coupon.start_date).getTime() > now) return "upcoming" as const;
  if (new Date(coupon.end_date).getTime() < now) return "expired" as const;
  if (coupon.total_usage_limit && (coupon.total_usage_count ?? 0) >= coupon.total_usage_limit) return "fullyRedeemed" as const;
  if (coupon.usage_per_user && (coupon.user_usage_count ?? 0) >= coupon.usage_per_user) return "limitReached" as const;
  return "available" as const;
}

export function CouponListItem({ coupon, isBusy = false, onToggle, compact = false, disabledReason, issue, savings }: Props) {
  const t = useTranslations("coupons");
  const couponText = useCouponText();
  const format = useFormatter();
  const formatAppCurrency = useAppCurrencyFormatter();
  const usability = couponUsability(coupon);
  const unavailable = usability !== "available" && !coupon.is_active;
  const value = coupon.discount_type === "PERCENTAGE"
    ? t("percentOff", { value: coupon.discount_value })
    : t("amountOff", { value: formatAppCurrency(format, coupon.discount_value) });
  const storeNames = coupon.offered_by?.map((store) => store.store_name).filter(Boolean) ?? [];
  const usesLeft = coupon.usage_per_user ? Math.max(0, coupon.usage_per_user - (coupon.user_usage_count ?? 0)) : null;
  const problem = issue ?? disabledReason;


  return (
    <article className={`relative overflow-hidden rounded-2xl bg-card ${coupon.is_active ? "ring-2 ring-brand/25" : "border border-line"}`}>
      <div className="flex min-w-0">
        <div className={`grid w-[82px] flex-none place-items-center bg-brand text-center text-ink sm:w-[104px] ${compact ? "min-h-40" : "min-h-48"}`}>
          <div className="px-2">
            <Tag className="mx-auto size-5 opacity-80" aria-hidden="true" />
            <strong className="mt-2 block text-base leading-tight tracking-[-0.02em] sm:text-lg">{value}</strong>
          </div>
        </div>
        <div className={`min-w-0 flex-1 ${compact ? "p-4" : "p-5 sm:p-6"}`}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-[15px] font-bold text-ink">{coupon.name}</h3>
                {coupon.is_active && issue ? <span className="rounded-full bg-danger-soft px-2.5 py-1 text-[10px] font-bold text-danger">{t("notApplied")}</span> : coupon.is_active ? <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">{t("active")}</span> : null}
                {!coupon.is_active && usability !== "available" ? <span className="rounded-full bg-[var(--soft-surface)] px-2.5 py-1 text-[10px] font-bold text-muted">{t(usability)}</span> : null}
              </div>
              {coupon.description ? <p className="mt-1 max-w-[62ch] text-xs leading-5 text-body">{coupon.description}</p> : null}
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-[11px] text-muted">
            <span>{t("validUntil", { date: format.dateTime(new Date(coupon.end_date), { day: "numeric", month: "short", year: "numeric" }) })}</span>
            {coupon.min_order_value > 0 ? <span>{t("minimumOrder", { value: formatAppCurrency(format, coupon.min_order_value) })}</span> : null}
            <span className="inline-flex min-w-0 items-center gap-1.5"><Store className="size-3.5 flex-none" aria-hidden="true" />{storeNames.length ? t("selectedStores", { stores: storeNames.slice(0, 2).join(", ") }) : t("allStores")}</span>
            <span className="inline-flex items-center gap-1.5"><CreditCard className="size-3.5 flex-none" aria-hidden="true" />{t("requirementsPayment", { methods: couponText.paymentMethods(coupon.payment_method) })}</span>
            <span className="inline-flex items-center gap-1.5"><Bike className="size-3.5 flex-none" aria-hidden="true" />{t("requirementsOrderType", { types: couponText.deliveryTypes(coupon.delivery_type) })}</span>
            {usesLeft !== null && usability === "available" ? <span className="inline-flex items-center gap-1.5"><Repeat className="size-3.5 flex-none" aria-hidden="true" />{t("usesLeft", { count: usesLeft })}</span> : null}
          </div>

          {savings && !problem ? <p className="mt-3 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">{t("youSave", { amount: savings })}</p> : null}
          {problem ? <p role={issue ? "alert" : undefined} className="mt-3 flex items-start gap-2 rounded-lg bg-danger-soft px-3 py-2 text-[11px] font-semibold leading-5 text-danger"><CircleAlert className="mt-0.5 size-3.5 flex-none" aria-hidden="true" />{problem}</p> : null}
          <button type="button" onClick={() => onToggle(coupon)} disabled={isBusy || unavailable || (Boolean(disabledReason) && !coupon.is_active)} className={`mt-4 inline-flex min-h-10 items-center justify-center gap-2 rounded-lg px-5 text-xs font-bold transition-[background-color,color,transform] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand/15 disabled:cursor-not-allowed disabled:opacity-50 ${coupon.is_active ? "border border-line text-ink hover:bg-[var(--soft-surface)]" : "bg-brand text-ink hover:-translate-y-0.5 hover:bg-brand/85"}`}>
            {isBusy ? <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> : null}
            {coupon.is_active ? t("deactivate") : t("activate")}
          </button>
        </div>
      </div>
    </article>
  );
}
