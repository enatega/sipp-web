"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
  LoaderCircle,
  RefreshCw,
  RotateCcw,
  Star,
  Store,
} from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { HistoryBackButton } from "@/components/shared/HistoryBackButton";
import { ProfileSidebar } from "@/modules/account/components/profile/ProfileSidebar";
import { OrderDetailSkeleton } from "./order-detail/OrderDetailSkeleton";
import { OrderFulfilmentPanel } from "./order-detail/OrderFulfilmentPanel";
import { OrderItemsPanel } from "./order-detail/OrderItemsPanel";
import { OrderRouteMap } from "./order-detail/OrderRouteMap";
import { OrderReviewDrawer } from "./order-detail/OrderReviewDrawer";
import { OrderStatusPanel } from "./order-detail/OrderStatusPanel";
import { OrderSummaryPanel } from "./order-detail/OrderSummaryPanel";
import {
  useOrderDetailQuery,
  useOrderReviewQuery,
} from "../hooks/useOrderDetail";
import { useOrderAgain } from "../hooks/useOrderAgain";
import {
  getOrderCode,
  RATEABLE_ORDER_STATUSES,
} from "../utils/orderDetail";

interface Props {
  orderId: string;
}

export function OrderDetailExperience({ orderId }: Props) {
  const t = useTranslations("deliveries.orderDetails");
  const format = useFormatter();
  const orderQuery = useOrderDetailQuery(orderId);
  const orderAgain = useOrderAgain();
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const isRateable = RATEABLE_ORDER_STATUSES.has(orderQuery.data?.status ?? "");
  const reviewQuery = useOrderReviewQuery(orderId, isRateable);

  if (orderQuery.isPending) return <OrderDetailSkeleton />;

  if (orderQuery.isError || !orderQuery.data) {
    return (
      <div className="min-[700px]:grid min-[700px]:grid-cols-[240px_1fr]">
        <ProfileSidebar />
        <main className="grid min-h-[65vh] place-items-center bg-background px-5 py-12 text-center">
          <div className="max-w-md">
            <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-danger-soft text-danger">
              <RefreshCw aria-hidden="true" className="size-6" />
            </span>
            <h1 className="mt-5 text-2xl font-bold text-ink">{t("loadErrorTitle")}</h1>
            <p className="mt-2 text-sm leading-6 text-body">{t("loadErrorMessage")}</p>
            <button
              className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-brand px-6 text-sm font-bold text-white transition-colors hover:bg-brand-deep"
              onClick={() => void orderQuery.refetch()}
              type="button"
            >
              {orderQuery.isFetching ? <LoaderCircle aria-hidden="true" className="size-4 animate-spin" /> : null}
              {t("retry")}
            </button>
          </div>
        </main>
      </div>
    );
  }

  const order = orderQuery.data;
  const code = getOrderCode(order);
  const storeName = order.store?.name || t("storeFallback");
  const products = order.orderItems?.products ?? [];
  const storeHref = order.store?.id ? `/restaurants/${order.store.id}` : "/discovery";

  return (
    <div className="min-[700px]:grid min-[700px]:grid-cols-[240px_1fr]">
      <ProfileSidebar />
      <main className="min-w-0 bg-[linear-gradient(180deg,var(--soft-surface)_0,transparent_360px)] px-4 pb-16 pt-6 sm:px-6 sm:pt-8 lg:px-10">
        <div className="mx-auto max-w-[1180px]">
          <HistoryBackButton />

          <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-bold tracking-[-0.025em] text-ink sm:text-4xl">
                  {t("orderTitle", { code })}
                </h1>
                {orderQuery.isFetching ? (
                  <LoaderCircle aria-label={t("refreshing")} className="size-4 animate-spin text-brand" />
                ) : null}
              </div>
              <p className="mt-2 flex items-center gap-2 text-sm text-body">
                <CalendarDays aria-hidden="true" className="size-4 text-muted" />
                {t("placedOn", {
                  date: format.dateTime(new Date(order.orderedAt), {
                    dateStyle: "long",
                    timeStyle: "short",
                  }),
                })}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                className="inline-flex min-h-11 items-center gap-2 rounded-full bg-brand px-5 text-sm font-bold text-white shadow-[0_8px_20px_rgba(183,24,47,0.2)] transition-[background-color,transform] hover:-translate-y-0.5 hover:bg-brand-deep disabled:cursor-wait disabled:opacity-55"
                disabled={orderAgain.isRunning}
                onClick={() => orderAgain.start(order)}
                type="button"
              >
                {orderAgain.isRunning ? (
                  <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
                ) : (
                  <RotateCcw aria-hidden="true" className="size-4" />
                )}
                {orderAgain.isRunning ? t("reordering") : t("orderAgain")}
              </button>
              {isRateable ? (
                <button
                  className="inline-flex min-h-11 items-center gap-2 rounded-full border border-brand/30 bg-card px-5 text-sm font-bold text-brand transition-colors hover:bg-brand/5 disabled:cursor-wait disabled:opacity-55"
                  disabled={reviewQuery.isPending}
                  onClick={() => setIsReviewOpen(true)}
                  type="button"
                >
                  {reviewQuery.isPending ? (
                    <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
                  ) : (
                    <Star aria-hidden="true" className="size-4" />
                  )}
                  {reviewQuery.data?.is_reviewed ? t("viewReview") : t("rateOrder")}
                </button>
              ) : null}
              <Link
                className="inline-flex min-h-11 items-center gap-2 rounded-full border border-brand/30 bg-card px-5 text-sm font-bold text-brand transition-colors hover:bg-brand/5"
                href={storeHref}
              >
                <Store aria-hidden="true" className="size-4" />
                {t("viewMenu")}
              </Link>
            </div>
          </div>

          <OrderRouteMap order={order} storeName={storeName} />

          {orderAgain.hasError ? (
            <p className="mt-4 rounded-xl bg-danger-soft px-4 py-3 text-sm font-medium text-danger" role="alert">
              {t("orderAgainError")}
            </p>
          ) : null}

          <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_350px]">
            <div className="min-w-0 space-y-6">
              <OrderStatusPanel order={order} />
              <OrderItemsPanel products={products} />
              <OrderFulfilmentPanel order={order} />
            </div>
            <OrderSummaryPanel order={order} />
          </div>
        </div>
      </main>

      {isReviewOpen ? (
        <OrderReviewDrawer
          onClose={() => setIsReviewOpen(false)}
          orderId={order.orderId}
          review={reviewQuery.data}
          storeName={storeName}
        />
      ) : null}

      {orderAgain.hasConflict ? (
        <div
          aria-labelledby="order-again-conflict-title"
          aria-modal="true"
          className="fixed inset-0 z-[80] grid place-items-center bg-black/55 p-5"
          role="dialog"
        >
          <div className="w-full max-w-sm rounded-2xl bg-card p-6 shadow-[0_24px_70px_rgba(20,10,14,0.3)]">
            <span className="grid size-11 place-items-center rounded-xl bg-danger-soft text-danger">
              <RotateCcw aria-hidden="true" className="size-5" />
            </span>
            <h2 className="mt-4 text-xl font-bold text-ink" id="order-again-conflict-title">
              {t("replaceCartTitle")}
            </h2>
            <p className="mt-2 text-sm leading-6 text-body">
              {t("replaceCartMessage", { store: storeName })}
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                className="min-h-10 rounded-full px-4 text-sm font-semibold text-body transition-colors hover:bg-[var(--soft-surface)]"
                onClick={orderAgain.cancelConflict}
                type="button"
              >
                {t("keepCart")}
              </button>
              <button
                className="min-h-10 rounded-full bg-brand px-5 text-sm font-bold text-white transition-colors hover:bg-brand-deep"
                onClick={orderAgain.confirmConflict}
                type="button"
              >
                {t("replaceAndReorder")}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
