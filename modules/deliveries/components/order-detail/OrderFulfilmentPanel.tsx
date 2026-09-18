"use client";

import {
  Bike,
  CalendarClock,
  Clock3,
  MessageSquareText,
  Navigation,
  Phone,
  Store,
} from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import type { OrderDetail } from "../../types/orders";

interface Props {
  order: OrderDetail;
}

interface DetailRowProps {
  icon: typeof Clock3;
  label: string;
  value: string;
}

function DetailRow({ icon: Icon, label, value }: DetailRowProps) {
  return (
    <div className="flex min-w-0 gap-3">
      <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-lg bg-[var(--soft-surface)] text-brand">
        <Icon aria-hidden="true" className="size-4" />
      </span>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">{label}</p>
        <p className="mt-1 break-words text-sm leading-5 text-ink">{value}</p>
      </div>
    </div>
  );
}

export function OrderFulfilmentPanel({ order }: Props) {
  const t = useTranslations("deliveries.orderDetails");
  const format = useFormatter();
  const isPickup = order.orderType === "pickup";
  const scheduledAt = order.scheduledAt
    ? format.dateTime(new Date(order.scheduledAt), {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : null;
  const liveEta = order.eta?.estimatedMinutes;
  const eta =
    typeof liveEta === "number" && Number.isFinite(liveEta) && liveEta >= 0
      ? liveEta
      : order.store?.estimatedDeliveryTime;
  const liveDistance = order.eta?.distanceKm;
  const distance =
    typeof liveDistance === "number" && Number.isFinite(liveDistance)
      ? liveDistance
      : order.summary?.deliveryDistanceKm;
  const hasEta = eta !== null && eta !== undefined && eta !== "";
  const riderPhone = order.rider?.phone?.trim();
  const hasDetails = Boolean(
    scheduledAt ||
      hasEta ||
      typeof distance === "number" ||
      order.rider?.name ||
      riderPhone ||
      order.restaurantNote ||
      order.courierNote,
  );

  if (!hasDetails) return null;

  return (
    <section className="rounded-2xl bg-card p-5 shadow-card sm:p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-ink">{t("fulfilmentTitle")}</h2>
          <p className="mt-1 text-xs text-muted">
            {isPickup ? t("pickupDescription") : t("deliveryDescription")}
          </p>
        </div>
        <span className="grid size-10 place-items-center rounded-xl bg-brand/10 text-brand">
          {isPickup ? <Store aria-hidden="true" className="size-5" /> : <Bike aria-hidden="true" className="size-5" />}
        </span>
      </div>

      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        {scheduledAt ? (
          <DetailRow icon={CalendarClock} label={t("scheduledFor")} value={scheduledAt} />
        ) : null}
        {hasEta ? (
          <DetailRow
            icon={Clock3}
            label={isPickup ? t("estimatedReadyTime") : t("estimatedDeliveryTime")}
            value={typeof eta === "number" ? t("minutes", { count: eta }) : String(eta)}
          />
        ) : null}
        {typeof distance === "number" ? (
          <DetailRow
            icon={Navigation}
            label={t("distance")}
            value={t("kilometres", { distance: format.number(distance, { maximumFractionDigits: 1 }) })}
          />
        ) : null}
        {order.rider?.name ? (
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-[var(--soft-surface)] text-brand">
              <Bike aria-hidden="true" className="size-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">{t("courier")}</p>
              <p className="mt-1 truncate text-sm font-semibold text-ink">{order.rider.name}</p>
            </div>
          </div>
        ) : null}
        {riderPhone ? (
          <a
            aria-label={t("callCourier", { name: order.rider?.name || riderPhone })}
            className="group flex min-w-0 gap-3 rounded-xl transition-colors hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30"
            href={`tel:${riderPhone}`}
          >
            <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-lg bg-[var(--soft-surface)] text-brand transition-colors group-hover:bg-brand/10">
              <Phone aria-hidden="true" className="size-4" />
            </span>
            <span className="min-w-0">
              <span className="block text-[11px] font-semibold uppercase tracking-wide text-muted">
                {t("courierContact")}
              </span>
              <span className="mt-1 block break-words text-sm font-semibold text-ink group-hover:text-brand">
                {riderPhone}
              </span>
            </span>
          </a>
        ) : null}
      </div>

      {order.restaurantNote || order.courierNote ? (
        <div className="mt-6 border-t border-line pt-5">
          <div className="flex items-center gap-2">
            <MessageSquareText aria-hidden="true" className="size-4 text-brand" />
            <h3 className="text-sm font-bold text-ink">{t("notesTitle")}</h3>
          </div>
          <dl className="mt-4 grid gap-4 sm:grid-cols-2">
            {order.restaurantNote ? (
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-wide text-muted">{t("restaurantNote")}</dt>
                <dd className="mt-1 text-sm leading-6 text-body">{order.restaurantNote}</dd>
              </div>
            ) : null}
            {order.courierNote ? (
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-wide text-muted">{t("courierNote")}</dt>
                <dd className="mt-1 text-sm leading-6 text-body">{order.courierNote}</dd>
              </div>
            ) : null}
          </dl>
        </div>
      ) : null}
    </section>
  );
}
