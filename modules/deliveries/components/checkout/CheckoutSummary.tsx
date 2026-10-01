"use client";

import { LoaderCircle, LockKeyhole } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { useAppCurrencyFormatter } from "@/lib/useAppCurrency";
import type { CheckoutPreview } from "../../types/checkout";
import type { CheckoutPaymentMethod } from "../../types/checkout";

interface Props {
  preview: CheckoutPreview | undefined;
  isLoading: boolean;
  isPlacing: boolean;
  disabled: boolean;
  paymentMethod: CheckoutPaymentMethod;
}

export function CheckoutSummary({ preview, isLoading, isPlacing, disabled, paymentMethod }: Props) {
  const t = useTranslations("deliveries.checkout");
  const format = useFormatter();
  const formatAppCurrency = useAppCurrencyFormatter();
  const price = (value: number) => formatAppCurrency(format, value);
  const pricing = preview?.pricing;
  const hasValue = (value: number) => Math.abs(value) > 0.0001;

  return (
    <aside className="rounded-3xl border border-line bg-card p-5 shadow-card lg:sticky lg:top-24 sm:p-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-ink">{t("summary")}</h2>
        {preview ? <span className="rounded-full bg-brand/10 px-3 py-1 text-[11px] font-bold text-brand">{t("itemCount", { count: preview.bucket.itemCount })}</span> : null}
      </div>
      {isLoading ? (
        <div className="grid min-h-48 place-items-center text-brand"><LoaderCircle aria-hidden="true" className="size-6 animate-spin" /><span className="sr-only">{t("updatingTotal")}</span></div>
      ) : pricing ? (
        <>
          <dl className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between gap-4 text-body"><dt>{t("subtotal")}</dt><dd className="font-medium text-ink">{price(pricing.subtotal)}</dd></div>
            {hasValue(pricing.discount) ? <div className="flex justify-between gap-4 text-emerald-600 dark:text-emerald-400"><dt>{t("discount")}</dt><dd className="font-semibold">− {price(pricing.discount)}</dd></div> : null}
            {hasValue(pricing.packingCharges) ? <div className="flex justify-between gap-4 text-body"><dt>{t("packing")}</dt><dd className="font-medium text-ink">{price(pricing.packingCharges)}</dd></div> : null}
            {preview.fulfillment.orderType === "delivery" || hasValue(pricing.deliveryFee) ? <div className="flex justify-between gap-4 text-body"><dt>{t("deliveryFee")}</dt><dd className={pricing.deliveryFee === 0 ? "font-semibold text-emerald-600 dark:text-emerald-400" : "font-medium text-ink"}>{pricing.deliveryFee === 0 ? t("free") : price(pricing.deliveryFee)}</dd></div> : null}
            <div className="flex justify-between gap-4 text-body"><dt>{t("includedTax")}</dt><dd className="font-medium text-ink">{price(pricing.tax)}</dd></div>
            {hasValue(pricing.riderTip) ? <div className="flex justify-between gap-4 text-body"><dt>{t("riderTip")}</dt><dd className="font-medium text-ink">{price(pricing.riderTip)}</dd></div> : null}
          </dl>
          <div className="my-5 border-t border-dashed border-line" />
          <div className="flex items-end justify-between gap-4"><dt className="text-base font-bold text-ink">{t("total")}</dt><dd className="text-2xl font-bold text-brand">{price(pricing.totalAmount)}</dd></div>
        </>
      ) : <p className="mt-5 rounded-xl bg-[var(--soft-surface)] p-4 text-sm leading-6 text-body">{t("completeDetails")}</p>}

      <button type="submit" disabled={disabled || !preview || isLoading || isPlacing} className="mt-6 inline-flex min-h-13 w-full items-center justify-center gap-2 rounded-full bg-brand px-5 text-sm font-bold text-ink shadow-[0_10px_24px_rgba(102,192,242,0.22)] transition-[transform,background-color] hover:-translate-y-0.5 hover:bg-brand/85 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0">
        {isPlacing ? <><LoaderCircle aria-hidden="true" className="size-4 animate-spin" />{paymentMethod === "stripe" ? t("preparingPayment") : t("placingOrder")}</> : paymentMethod === "stripe" ? t("continueToPayment", { total: pricing ? price(pricing.totalAmount) : "" }) : t("placeOrder", { total: pricing ? price(pricing.totalAmount) : "" })}
      </button>
      <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-[11px] text-muted"><LockKeyhole aria-hidden="true" className="size-3.5" />{t("securePayment")}</p>
    </aside>
  );
}
