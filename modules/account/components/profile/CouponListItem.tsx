"use client";

import { Check, Copy, LoaderCircle, Store, Tag } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { useState } from "react";
import type { ClaimedCoupon } from "@/modules/account/types/coupons";

interface Props {
  coupon: ClaimedCoupon;
  isBusy?: boolean;
  onToggle: (coupon: ClaimedCoupon) => void;
  compact?: boolean;
  disabledReason?: string;
}

export function couponUsability(coupon: ClaimedCoupon) {
  const now = Date.now();
  if (coupon.status !== "active") return "unavailable" as const;
  if (new Date(coupon.start_date).getTime() > now) return "upcoming" as const;
  if (new Date(coupon.end_date).getTime() < now) return "expired" as const;
  return "available" as const;
}

export function CouponListItem({ coupon, isBusy = false, onToggle, compact = false, disabledReason }: Props) {
  const t = useTranslations("coupons");
  const format = useFormatter();
  const [copied, setCopied] = useState(false);
  const usability = couponUsability(coupon);
  const unavailable = usability !== "available" && !coupon.is_active;
  const value = coupon.discount_type === "PERCENTAGE"
    ? t("percentOff", { value: coupon.discount_value })
    : t("amountOff", { value: format.number(coupon.discount_value, { style: "currency", currency: "INR", maximumFractionDigits: 2 }) });
  const storeNames = coupon.offered_by?.map((store) => store.store_name).filter(Boolean) ?? [];

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(coupon.code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <article className={`relative overflow-hidden rounded-2xl bg-card ${coupon.is_active ? "ring-2 ring-brand/25" : "border border-line"}`}>
      <div className="flex min-w-0">
        <div className={`grid w-[82px] flex-none place-items-center bg-brand text-center text-white sm:w-[104px] ${compact ? "min-h-40" : "min-h-48"}`}>
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
                {coupon.is_active ? <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">{t("active")}</span> : null}
                {!coupon.is_active && usability !== "available" ? <span className="rounded-full bg-[var(--soft-surface)] px-2.5 py-1 text-[10px] font-bold text-muted">{t(usability)}</span> : null}
              </div>
              {coupon.description ? <p className="mt-1 max-w-[62ch] text-xs leading-5 text-body">{coupon.description}</p> : null}
            </div>
            <button type="button" onClick={() => void copyCode()} className="inline-flex min-h-9 items-center gap-2 rounded-lg bg-[var(--soft-surface)] px-3 font-mono text-xs font-bold tracking-[0.08em] text-ink transition-colors hover:bg-brand/10 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand/15" aria-label={t("copyCode", { code: coupon.code })}>
              {copied ? <Check className="size-3.5 text-emerald-600" aria-hidden="true" /> : <Copy className="size-3.5 text-brand" aria-hidden="true" />}
              {coupon.code}
            </button>
          </div>

          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-[11px] text-muted">
            <span>{t("validUntil", { date: format.dateTime(new Date(coupon.end_date), { day: "numeric", month: "short", year: "numeric" }) })}</span>
            {coupon.min_order_value > 0 ? <span>{t("minimumOrder", { value: format.number(coupon.min_order_value, { style: "currency", currency: "INR", maximumFractionDigits: 2 }) })}</span> : null}
            <span className="inline-flex min-w-0 items-center gap-1.5"><Store className="size-3.5 flex-none" aria-hidden="true" />{storeNames.length ? t("selectedStores", { stores: storeNames.slice(0, 2).join(", ") }) : t("allStores")}</span>
          </div>

          {disabledReason ? <p className="mt-3 text-[11px] font-medium leading-5 text-amber-700 dark:text-amber-300">{disabledReason}</p> : null}
          <button type="button" onClick={() => onToggle(coupon)} disabled={isBusy || unavailable || (Boolean(disabledReason) && !coupon.is_active)} className={`mt-4 inline-flex min-h-10 items-center justify-center gap-2 rounded-lg px-5 text-xs font-bold transition-[background-color,color,transform] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand/15 disabled:cursor-not-allowed disabled:opacity-50 ${coupon.is_active ? "border border-line text-ink hover:bg-[var(--soft-surface)]" : "bg-brand text-white hover:-translate-y-0.5 hover:bg-brand-deep"}`}>
            {isBusy ? <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> : null}
            {coupon.is_active ? t("deactivate") : t("activate")}
          </button>
        </div>
      </div>
    </article>
  );
}
