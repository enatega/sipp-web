"use client";

import { Check, Circle, Clock3, PackageCheck, Store, Truck } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import type { OrderDetail } from "../../types/orders";
import {
  getOrderProgressStage,
  getOrderStatusKey,
  getOrderStatusTone,
  normalizeOrderStatus,
} from "../../utils/orderDetail";

interface Props {
  order: OrderDetail;
}

const toneClasses = {
  active: "bg-brand text-ink",
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning",
  danger: "bg-danger-soft text-danger",
};

export function OrderStatusPanel({ order }: Props) {
  const t = useTranslations("deliveries.orderDetails");
  const format = useFormatter();
  const status = normalizeOrderStatus(order.status);
  const statusKey = getOrderStatusKey(status);
  const tone = getOrderStatusTone(status);
  const isPickup = order.orderType === "pickup";
  const isStopped = ["cancelled", "rejected", "failed"].includes(status);
  const activeStage = getOrderProgressStage(status);
  const stages = [
    { icon: PackageCheck, label: t("progressPlaced") },
    { icon: Store, label: t("progressPreparing") },
    {
      icon: Truck,
      label: isPickup ? t("progressReadyPickup") : t("progressOnWay"),
    },
    {
      icon: Check,
      label: isPickup ? t("progressCollected") : t("progressDelivered"),
    },
  ];
  const logs = [...(order.orderLogs ?? [])].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
  );

  return (
    <section className="overflow-hidden rounded-2xl bg-card shadow-card">
      <div className={cn("p-5 sm:p-6", toneClasses[tone])} role="status">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] opacity-80">
              {!isStopped && status !== "delivered" ? (
                <span className="relative flex size-2.5">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-current opacity-35 motion-reduce:animate-none" />
                  <span className="relative inline-flex size-2.5 rounded-full bg-current" />
                </span>
              ) : null}
              {t("orderStatus")}
            </div>
            <h2 className="mt-2 text-xl font-bold sm:text-2xl">
              {t(`status.${statusKey}.title`)}
            </h2>
            <p className="mt-1 max-w-2xl text-sm leading-6 opacity-85">
              {t(`status.${statusKey}.message`)}
            </p>
            {isStopped && order.rejectionReason ? (
              <p className="mt-3 max-w-2xl rounded-lg bg-black/5 px-3 py-2 text-xs leading-5 opacity-85 dark:bg-white/10">
                <span className="font-bold">{t("storeUpdate")}:</span>{" "}
                {order.rejectionReason}
              </p>
            ) : null}
          </div>
          <Clock3 aria-hidden="true" className="size-6 shrink-0 opacity-75" />
        </div>
      </div>

      {!isStopped ? (
        <div className="px-5 py-6 sm:px-7 sm:py-7">
          <ol className="grid grid-cols-4" aria-label={t("progressLabel")}>
            {stages.map((stage, index) => {
              const isComplete = index < activeStage || status === "delivered";
              const isActive = index === activeStage && status !== "delivered";
              const Icon = stage.icon;
              return (
                <li className="relative min-w-0 text-center" key={stage.label}>
                  {index > 0 ? (
                    <span
                      aria-hidden="true"
                      className={cn(
                        "absolute right-1/2 top-5 h-0.5 w-full",
                        index <= activeStage ? "bg-brand" : "bg-line",
                      )}
                    />
                  ) : null}
                  <span
                    className={cn(
                      "relative z-10 mx-auto grid size-10 place-items-center rounded-full border bg-card",
                      isComplete || isActive
                        ? "border-brand text-brand"
                        : "border-line text-muted",
                      isActive && "ring-4 ring-brand/10",
                    )}
                  >
                    {isComplete ? (
                      <Check aria-hidden="true" className="size-4" strokeWidth={3} />
                    ) : (
                      <Icon aria-hidden="true" className="size-4" />
                    )}
                  </span>
                  <span
                    className={cn(
                      "mx-auto mt-2 block max-w-24 text-[10px] font-semibold leading-4 sm:text-xs",
                      isComplete || isActive ? "text-ink" : "text-muted",
                    )}
                  >
                    {stage.label}
                  </span>
                </li>
              );
            })}
          </ol>
        </div>
      ) : null}

      {logs.length ? (
        <details className="border-t border-line px-5 py-4 sm:px-7">
          <summary className="cursor-pointer text-sm font-bold text-ink marker:text-brand">
            {t("activity", { count: logs.length })}
          </summary>
          <ol className="mt-4 space-y-4">
            {logs.map((log, index) => (
              <li className="relative flex gap-3" key={`${log.status}-${log.timestamp}-${index}`}>
                <span className="mt-1 grid size-5 shrink-0 place-items-center rounded-full bg-[var(--soft-surface)] text-brand">
                  <Circle aria-hidden="true" className="size-2 fill-current" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-ink">
                    {t(`status.${getOrderStatusKey(log.status)}.title`)}
                  </p>
                  <time className="mt-0.5 block text-xs text-muted" dateTime={log.timestamp}>
                    {format.dateTime(new Date(log.timestamp), {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </time>
                </div>
              </li>
            ))}
          </ol>
        </details>
      ) : null}
    </section>
  );
}
