"use client";

import { ChevronDown, LoaderCircle, TicketPercent } from "lucide-react";
import { useMemo, useState } from "react";
import { useFormatter, useTranslations } from "next-intl";
import { useAppCurrencyFormatter } from "@/lib/useAppCurrency";
import { CouponListItem } from "@/modules/account/components/profile/CouponListItem";
import { useClaimCouponMutation, useClaimedCouponsQuery, useCouponActivationMutation } from "@/modules/account/queries/useCouponQueries";
import { ApiError } from "@/services/api/client";
import type { ClaimedCoupon } from "@/modules/account/types/coupons";

interface Props {
  enabled: boolean;
  storeId: string | null;
  subtotal: number;
  appliedCouponId: string | null;
  appliedCouponCode: string | null;
}

export function CheckoutCouponSection({ enabled, storeId, subtotal, appliedCouponId, appliedCouponCode }: Props) {
  const t = useTranslations("deliveries.checkout");
  const couponT = useTranslations("coupons");
  const format = useFormatter();
  const formatAppCurrency = useAppCurrencyFormatter();
  const coupons = useClaimedCouponsQuery(enabled);
  const claim = useClaimCouponMutation();
  const activation = useCouponActivationMutation();
  const [code, setCode] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ kind: "success" | "error"; text: string } | null>(null);
  const items = useMemo(() => coupons.data?.pages.flatMap((page) => page.data) ?? [], [coupons.data]);
  const activeCoupon = items.find((coupon) => coupon.id === appliedCouponId && !disabledReason(coupon));
  const activeCouponCode = activeCoupon?.code ?? appliedCouponCode ?? "";

  function disabledReason(coupon: ClaimedCoupon) {
    if (coupon.min_order_value > subtotal) return t("couponMinimumNotMet", { amount: formatAppCurrency(format, coupon.min_order_value) });
    if (coupon.offered_by?.length && !coupon.offered_by.some((store) => store.store_id === storeId)) return t("couponWrongStore");
    return undefined;
  }

  async function claimCode() {
    const normalized = code.trim().toUpperCase();
    setNotice(null);
    if (!/^[A-Z0-9_-]{2,64}$/.test(normalized)) {
      setNotice({ kind: "error", text: couponT("invalidCode") });
      return;
    }
    try {
      await claim.mutateAsync(normalized);
      setCode("");
      setNotice({ kind: "success", text: t("couponClaimed") });
    } catch (error) {
      const text = error instanceof ApiError && error.status === 409 ? couponT("alreadyClaimed") : error instanceof ApiError && error.status === 400 ? couponT("invalidCode") : couponT("genericError");
      setNotice({ kind: "error", text });
    }
  }

  async function toggleCoupon(coupon: ClaimedCoupon) {
    setNotice(null);
    setBusyId(coupon.id);
    try {
      await activation.mutateAsync({ id: coupon.id, isActive: !coupon.is_active });
      setNotice({ kind: "success", text: coupon.is_active ? t("couponRemoved") : t("couponApplied") });
    } catch (error) {
      setNotice({ kind: "error", text: error instanceof ApiError && error.status === 400 ? t("couponNotApplicable") : couponT("genericError") });
    } finally {
      setBusyId(null);
    }
  }

  async function removeAppliedCoupon() {
    if (!appliedCouponId) return;
    setNotice(null);
    setBusyId(appliedCouponId);
    try {
      await activation.mutateAsync({ id: appliedCouponId, isActive: false });
      setNotice({ kind: "success", text: t("couponRemoved") });
    } catch {
      setNotice({ kind: "error", text: couponT("genericError") });
    } finally {
      setBusyId(null);
    }
  }

  return (
    <section className="rounded-3xl border border-line bg-card p-5 shadow-[0_8px_26px_rgba(35,22,26,0.045)] sm:p-6" aria-labelledby="checkout-coupon-title">
      <div className="flex items-center gap-3">
        <span className="grid size-10 place-items-center rounded-xl bg-brand/10 text-brand"><TicketPercent aria-hidden="true" className="size-5" /></span>
        <div><h2 id="checkout-coupon-title" className="font-bold text-ink">{t("couponTitle")}</h2><p className="text-xs text-muted">{t("couponDescription")}</p></div>
      </div>

      <div className="mt-5 flex flex-col gap-2 sm:flex-row">
        <label className="sr-only" htmlFor="checkout-coupon-code">{t("couponCode")}</label>
        <input id="checkout-coupon-code" value={code} onChange={(event) => setCode(event.target.value.toUpperCase())} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); void claimCode(); } }} maxLength={64} autoComplete="off" spellCheck={false} placeholder={t("couponCodePlaceholder")} className="min-h-12 min-w-0 flex-1 rounded-xl border border-line bg-surface px-4 font-mono text-sm font-bold uppercase tracking-[0.08em] text-ink outline-none placeholder:font-sans placeholder:font-normal placeholder:tracking-normal placeholder:text-muted focus:border-brand focus:ring-4 focus:ring-brand/10" />
        <button type="button" onClick={() => void claimCode()} disabled={claim.isPending || !code.trim()} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-brand px-5 text-sm font-bold text-ink hover:bg-brand/85 disabled:cursor-not-allowed disabled:opacity-50">{claim.isPending ? <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> : null}{t("claimCoupon")}</button>
      </div>

      {notice ? <p role={notice.kind === "error" ? "alert" : "status"} className={`mt-3 rounded-xl px-4 py-3 text-xs font-medium ${notice.kind === "error" ? "bg-danger-soft text-danger" : "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"}`}>{notice.text}</p> : null}

      {appliedCouponId ? (
        <div className="mt-4 flex flex-col gap-3 rounded-xl border border-brand/20 bg-brand/5 p-4 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-xs font-bold text-ink">
            {t("activeCoupon", { code: activeCouponCode || "..." })}
          </span>
          <button
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-line bg-surface px-4 text-xs font-bold text-ink hover:bg-[var(--soft-surface)] disabled:cursor-not-allowed disabled:opacity-50"
            disabled={activation.isPending && busyId === appliedCouponId}
            onClick={() => void removeAppliedCoupon()}
            type="button"
          >
            {activation.isPending && busyId === appliedCouponId ? <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> : null}
            {couponT("deactivate")}
          </button>
        </div>
      ) : null}

      {coupons.isPending ? <div className="mt-4 flex items-center gap-2 text-xs text-muted" role="status"><LoaderCircle className="size-4 animate-spin text-brand" aria-hidden="true" />{t("loadingCoupons")}</div> : coupons.isError ? <button type="button" onClick={() => void coupons.refetch()} className="mt-4 text-xs font-bold text-brand">{t("retryCoupons")}</button> : items.length ? (
        <details className="group mt-4">
          <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 rounded-xl bg-[var(--soft-surface)] px-4 text-xs font-bold text-ink outline-none focus-visible:ring-4 focus-visible:ring-brand/10 [&::-webkit-details-marker]:hidden">
            <span>{t("chooseCoupon", { count: items.length })}</span>
            <ChevronDown className="size-4 text-brand transition-transform group-open:rotate-180" aria-hidden="true" />
          </summary>
          <div className="mt-3 grid gap-3">
            {items.map((coupon) => {
              const reason = disabledReason(coupon);
              const checkoutCoupon = { ...coupon, is_active: coupon.id === appliedCouponId && !reason };
              return <CouponListItem key={coupon.id} coupon={checkoutCoupon} compact isBusy={activation.isPending && busyId === coupon.id} disabledReason={reason} onToggle={(selected) => void toggleCoupon(selected)} />;
            })}
            {coupons.hasNextPage ? <button type="button" onClick={() => void coupons.fetchNextPage()} disabled={coupons.isFetchingNextPage} className="min-h-10 rounded-lg border border-line text-xs font-bold text-ink hover:border-brand/30 disabled:opacity-50">{coupons.isFetchingNextPage ? t("loadingCoupons") : t("moreCoupons")}</button> : null}
          </div>
        </details>
      ) : <p className="mt-4 text-xs leading-5 text-body">{t("noClaimedCoupons")}</p>}
    </section>
  );
}
