"use client";

import Link from "next/link";
import { useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { ArrowRight, PackageCheck, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { ordersApi } from "../../api/orders";
import { deliveryQueryKeys } from "../../queries/queryKeys";
import type { OrderCard } from "../../types/orders";
import { getOrderStatusKey } from "../../utils/orderDetail";

const POSITION_CLASS = "fixed bottom-20 end-4 z-40 sm:bottom-5 sm:end-5 [body:has([aria-modal=true])_&]:hidden!";

export function FloatingOrderTracker() {
  const t = useTranslations("deliveries.tracker");
  const [isExpanded, setIsExpanded] = useState(false);
  const orders = useInfiniteQuery({
    queryKey: deliveryQueryKeys.orderList("active"),
    queryFn: ({ pageParam, signal }) => ordersApi.list("active", pageParam, signal),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextOffset ?? undefined,
    refetchInterval: 30_000,
    refetchIntervalInBackground: false,
  });
  const first = orders.data?.pages[0];
  const active = (first?.items ?? []).filter((order) => {
    const status = getOrderStatusKey(order.status ?? order.orderStatus);
    return !["scheduled", "delivered", "cancelled", "rejected", "failed"].includes(status);
  });
  const latest = [...active].sort((left, right) =>
    new Date(right.orderedAt).getTime() - new Date(left.orderedAt).getTime())[0] as OrderCard | undefined;
  if (!latest || !first || orders.isError) return null;

  const status = getOrderStatusKey(latest.status ?? latest.orderStatus);
  const statusLabels: Record<string, string> = {
    pending: t("status.pending"), accepted: t("status.accepted"),
    preparing: t("status.preparing"), ready: t("status.ready"),
    rider_assigned: t("status.riderAssigned"), picked_up: t("status.pickedUp"),
    out_for_delivery: t("status.outForDelivery"), arrived: t("status.arrived"),
  };
  const code = latest.orderCode?.trim() || latest.orderId.slice(0, 8).toUpperCase();
  if (!isExpanded) {
    return (
      <button
        type="button"
        aria-label={t("openTracker")}
        aria-expanded="false"
        aria-controls="live-order-tracker"
        onClick={() => setIsExpanded(true)}
        className={`${POSITION_CLASS} group grid size-14 place-items-center rounded-full bg-brand text-ink shadow-[0_14px_30px_color-mix(in_srgb,var(--color-brand)_38%,transparent),inset_0_2px_1px_rgb(255_255_255/0.38)] ring-4 ring-card transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-1 hover:bg-brand/85 hover:shadow-[0_18px_34px_color-mix(in_srgb,var(--color-brand)_46%,transparent),inset_0_2px_1px_rgb(255_255_255/0.42)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand active:translate-y-0 active:scale-95 motion-reduce:transition-none`}
      >
        <PackageCheck aria-hidden="true" className="size-6 drop-shadow-[0_1px_1px_rgb(0_0_0/0.16)]" />
        <span aria-hidden="true" className="absolute -end-0.5 -top-0.5 grid size-4 place-items-center rounded-full bg-card shadow-[0_2px_7px_rgb(0_0_0/0.16)]">
          <span className="absolute size-2.5 animate-ping rounded-full bg-success/45 motion-reduce:animate-none" />
          <span className="relative size-2.5 rounded-full bg-success" />
        </span>
        <span aria-hidden="true" className="pointer-events-none absolute end-[calc(100%+0.75rem)] whitespace-nowrap rounded-full bg-ink px-3 py-1.5 text-xs font-semibold text-card opacity-0 shadow-card transition-[opacity,transform] duration-200 group-hover:-translate-x-1 group-hover:opacity-100 group-focus-visible:-translate-x-1 group-focus-visible:opacity-100 motion-reduce:transition-none rtl:group-hover:translate-x-1 rtl:group-focus-visible:translate-x-1">
          {t("title")}
        </span>
      </button>
    );
  }

  return (
    <aside
      id="live-order-tracker"
      aria-label={t("label")}
      className={`${POSITION_CLASS} w-[min(360px,calc(100vw-2rem))] rounded-2xl border border-line bg-card p-4 text-ink shadow-pop`}
    >
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand/15 text-brand"><PackageCheck aria-hidden="true" className="size-5" /></span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase tracking-wide text-brand">{t("title")}</p>
          <p className="mt-0.5 truncate text-sm font-semibold">{latest.store?.name || latest.storeName || t("storeFallback")} · #{code.replace(/^#/, "")}</p>
          <p aria-live="polite" className="mt-1 text-xs text-body">{statusLabels[status] || t("status.unknown")}</p>
        </div>
        <button
          type="button"
          aria-label={t("closeTracker")}
          aria-expanded="true"
          aria-controls="live-order-tracker"
          onClick={() => setIsExpanded(false)}
          className="grid size-9 shrink-0 place-items-center rounded-full text-muted transition-colors hover:bg-soft-surface hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          <X aria-hidden="true" className="size-4" />
        </button>
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-3 text-xs font-semibold">
        <Link className="inline-flex items-center gap-1 text-brand hover:underline" href={`/orders/${encodeURIComponent(latest.orderId)}`}>{t("trackOrder")}<ArrowRight aria-hidden="true" className="size-3.5 rtl:rotate-180" /></Link>
        {first.total > 1 ? <Link className="text-body hover:text-brand hover:underline" href="/orders">{t("moreActive", { count: first.total - 1 })}</Link> : null}
      </div>
    </aside>
  );
}
