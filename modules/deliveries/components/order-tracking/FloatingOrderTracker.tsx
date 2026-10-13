"use client";

import Link from "next/link";
import { useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { ArrowRight, ChevronDown, PackageCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import { ordersApi } from "../../api/orders";
import { deliveryQueryKeys } from "../../queries/queryKeys";
import type { OrderCard } from "../../types/orders";
import { getOrderStatusKey } from "../../utils/orderDetail";

// Collapses to the icon while a search panel is open and hides behind modal dialogs so it never blocks their content.
const POSITION_CLASS = "fixed bottom-[max(0.75rem,env(safe-area-inset-bottom))] right-3 z-40 sm:bottom-5 sm:right-5 [body:has([aria-modal=true])_&]:hidden!";

export function FloatingOrderTracker() {
  const t = useTranslations("deliveries.tracker");
  const [isMinimized, setIsMinimized] = useState(false);
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
  const storeLabel = `${latest.store?.name || latest.storeName || t("storeFallback")} · #${code.replace(/^#/, "")}`;
  const statusLabel = statusLabels[status] || t("status.unknown");

  const minimizedButton = <button aria-label={`${t("expand")}: ${statusLabel}`} className={`${POSITION_CLASS} ${isMinimized ? "grid" : "hidden [body:has([data-minimize-floating-tracker])_&]:grid"} size-12 place-items-center rounded-full border border-line bg-card text-brand shadow-pop transition hover:bg-brand/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand`} onClick={() => setIsMinimized(false)} type="button">
    <PackageCheck aria-hidden="true" className="size-5" />
    <span aria-hidden="true" className="absolute right-0.5 top-0.5 size-2.5 animate-pulse rounded-full bg-brand ring-2 ring-card" />
  </button>;
  if (isMinimized) return minimizedButton;

  return <>
  {minimizedButton}
  <aside aria-label={t("label")} className={`${POSITION_CLASS} left-3 rounded-2xl border border-line bg-card p-3 text-ink shadow-pop sm:left-auto sm:w-[360px] sm:p-4 [body:has([data-minimize-floating-tracker])_&]:hidden`}>
    <div className="flex items-center gap-3 sm:items-start">
      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand/15 text-brand sm:size-10"><PackageCheck aria-hidden="true" className="size-5" /></span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[11px] font-bold uppercase tracking-wide text-brand sm:text-xs">{t("title")}<span aria-live="polite" className="font-semibold normal-case tracking-normal text-body sm:hidden"> · {statusLabel}</span></p>
        <p className="mt-0.5 truncate text-sm font-semibold">{storeLabel}</p>
        <p aria-live="polite" className="mt-1 hidden text-xs text-body sm:block">{statusLabel}</p>
      </div>
      <Link aria-label={t("trackOrder")} className="grid size-9 shrink-0 place-items-center rounded-full bg-brand/15 text-brand hover:bg-brand/25 sm:hidden" href={`/orders/${encodeURIComponent(latest.orderId)}`}><ArrowRight aria-hidden="true" className="size-4" /></Link>
      <button aria-label={t("minimize")} className="-mr-1 grid size-8 shrink-0 place-items-center rounded-full text-muted hover:bg-brand/10 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand sm:-mt-1" onClick={() => setIsMinimized(true)} type="button"><ChevronDown aria-hidden="true" className="size-4" /></button>
    </div>
    <div className="mt-3 hidden items-center justify-between gap-3 border-t border-line pt-3 text-xs font-semibold sm:flex">
      <Link className="inline-flex items-center gap-1 text-brand hover:underline" href={`/orders/${encodeURIComponent(latest.orderId)}`}>{t("trackOrder")}<ArrowRight aria-hidden="true" className="size-3.5" /></Link>
      {first.total > 1 ? <Link className="text-body hover:text-brand hover:underline" href="/orders">{t("moreActive", { count: first.total - 1 })}</Link> : null}
    </div>
  </aside>
  </>;
}
