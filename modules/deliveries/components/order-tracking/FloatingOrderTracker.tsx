"use client";

import Link from "next/link";
import { useInfiniteQuery } from "@tanstack/react-query";
import { ArrowRight, PackageCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import { ordersApi } from "../../api/orders";
import { deliveryQueryKeys } from "../../queries/queryKeys";
import type { OrderCard } from "../../types/orders";
import { getOrderStatusKey } from "../../utils/orderDetail";

export function FloatingOrderTracker() {
  const t = useTranslations("deliveries.tracker");
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
  return <aside aria-label={t("label")} className="fixed bottom-24 right-4 z-40 w-[min(360px,calc(100vw-2rem))] rounded-2xl border border-line bg-card p-4 text-ink shadow-pop sm:bottom-5 sm:right-5">
    <div className="flex items-start gap-3">
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand/15 text-brand"><PackageCheck aria-hidden="true" className="size-5" /></span>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-bold uppercase tracking-wide text-brand">{t("title")}</p>
        <p className="mt-0.5 truncate text-sm font-semibold">{latest.store?.name || latest.storeName || t("storeFallback")} · #{code.replace(/^#/, "")}</p>
        <p aria-live="polite" className="mt-1 text-xs text-body">{statusLabels[status] || t("status.unknown")}</p>
      </div>
    </div>
    <div className="mt-3 flex items-center justify-between gap-3 border-t border-line pt-3 text-xs font-semibold">
      <Link className="inline-flex items-center gap-1 text-brand hover:underline" href={`/orders/${encodeURIComponent(latest.orderId)}`}>{t("trackOrder")}<ArrowRight aria-hidden="true" className="size-3.5" /></Link>
      {first.total > 1 ? <Link className="text-body hover:text-brand hover:underline" href="/orders">{t("moreActive", { count: first.total - 1 })}</Link> : null}
    </div>
  </aside>;
}
