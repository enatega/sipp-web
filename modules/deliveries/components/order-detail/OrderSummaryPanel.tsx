"use client";

import { BadgePercent, CreditCard, ReceiptText } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { formatAppCurrency } from "@/config/currency";
import type { OrderDetail } from "../../types/orders";
import { hasAmount } from "../../utils/orderDetail";

interface Props {
  order: OrderDetail;
}

export function OrderSummaryPanel({ order }: Props) {
  const t = useTranslations("deliveries.orderDetails");
  const format = useFormatter();
  const summary = order.summary;
  const hasAppliedCoupon = Boolean(
    summary?.couponCode && hasAmount(summary.discountAmount),
  );
  const money = (value?: number | null) =>
    formatAppCurrency(format, value ?? 0);
  const rows = [
    { label: t("subtotal"), value: summary?.itemSubtotal ?? summary?.subtotal ?? 0 },
    ...(hasAmount(summary?.discountAmount)
      ? [{ label: t("discount"), value: -(summary?.discountAmount ?? 0), discount: true }]
      : []),
    ...(hasAmount(summary?.taxAmount)
      ? [{ label: t("tax"), value: summary?.taxAmount ?? 0 }]
      : []),
    ...(hasAmount(summary?.packingCharges)
      ? [{ label: t("packingCharges"), value: summary?.packingCharges ?? 0 }]
      : []),
    ...(hasAmount(summary?.deliveryFee)
      ? [{ label: t("deliveryFee"), value: summary?.deliveryFee ?? 0 }]
      : []),
    ...(hasAmount(summary?.courierTip)
      ? [{ label: t("courierTip"), value: summary?.courierTip ?? 0 }]
      : []),
  ];

  return (
    <aside className="space-y-5 lg:sticky lg:top-24">
      <section className="rounded-2xl bg-card p-5 shadow-card sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-ink">{t("summaryTitle")}</h2>
          <ReceiptText aria-hidden="true" className="size-5 text-brand" />
        </div>
        <div className="mt-5 space-y-3">
          {rows.map((row) => (
            <div className="flex justify-between gap-5 text-sm" key={row.label}>
              <span className="text-body">{row.label}</span>
              <span className={row.discount ? "font-semibold text-success" : "font-medium text-ink"}>
                {money(row.value)}
              </span>
            </div>
          ))}
          {!hasAmount(summary?.deliveryFee) && order.orderType !== "pickup" ? (
            <div className="flex justify-between gap-5 text-sm">
              <span className="text-body">{t("deliveryFee")}</span>
              <span className="font-semibold text-success">{t("free")}</span>
            </div>
          ) : null}
        </div>

        {hasAppliedCoupon ? (
          <div className="mt-5 flex items-center gap-2 rounded-xl bg-success-soft px-3 py-2.5 text-xs font-semibold text-success">
            <BadgePercent aria-hidden="true" className="size-4 shrink-0" />
            {t("couponApplied", { code: summary!.couponCode! })}
          </div>
        ) : null}

        <div className="my-5 border-t border-dashed border-line" />
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="font-bold text-ink">{t("total")}</p>
            <p className="mt-1 text-[11px] text-muted">{t("totalHint")}</p>
          </div>
          <strong className="text-2xl tabular-nums text-brand">
            {money(summary?.totalAmount)}
          </strong>
        </div>
      </section>

      <section className="rounded-2xl bg-card p-5 shadow-card sm:p-6">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-xl bg-brand/10 text-brand">
            <CreditCard aria-hidden="true" className="size-5" />
          </span>
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-ink">{t("paymentTitle")}</h2>
            <p className="mt-0.5 text-xs text-body">
              {order.paymentMethod === "stripe" || order.paymentMethod === "card"
                ? t("paymentCard")
                : order.paymentMethod === "cod" || order.paymentMethod === "cash"
                  ? t("paymentCash")
                  : t("paymentOther")}
            </p>
          </div>
          <span className="ml-auto rounded-full bg-[var(--soft-surface)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-body">
            {order.paymentStatus === "paid" || order.paymentStatus === "succeeded"
              ? t("paymentPaid")
              : order.paymentStatus === "failed"
                ? t("paymentFailed")
                : t("paymentPending")}
          </span>
        </div>
      </section>
    </aside>
  );
}
