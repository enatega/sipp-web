import Link from "next/link";
import { Bike, Clock3, MapPin, Star, Tag } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { formatAppCurrency } from "@/config/currency";
import { DeliveryImage } from "@/modules/deliveries/components/discovery/DeliveryImage";
import type { DeliveryStore } from "@/modules/deliveries/types/discovery";

function offerLabel(
  store: DeliveryStore,
  amount: (value: number) => string,
  off: string,
) {
  if (store.dealAmount && store.dealAmount > 0) {
    return store.dealType?.toLowerCase() === "percentage"
      ? `${store.dealAmount}% ${off}`
      : `${amount(store.dealAmount)} ${off}`;
  }
  return store.deal?.trim() || null;
}

function deliveryTimeLabel(
  value: DeliveryStore["deliveryTime"],
  minutesLabel: (count: number) => string,
) {
  if (typeof value === "number") {
    return Number.isFinite(value) && value > 0 ? minutesLabel(value) : null;
  }

  const normalized = value?.trim();
  if (!normalized) return null;
  const numericValue = Number.parseFloat(normalized);
  return Number.isNaN(numericValue) || numericValue > 0 ? normalized : null;
}

export function StoreCard({ store, fluid = false }: { store: DeliveryStore; fluid?: boolean }) {
  const t = useTranslations("deliveries.discovery");
  const format = useFormatter();
  const isClosed = store.isOpen === false || store.isAvailable === false;
  const offer = offerLabel(
    store,
    (value) => formatAppCurrency(format, value),
    t("off"),
  );
  const hasFeeDetails =
    typeof store.deliveryFee === "number" && Number.isFinite(store.deliveryFee);
  const fee =
    hasFeeDetails && store.deliveryFee === 0
      ? t("freeDelivery")
      : formatAppCurrency(format, store.deliveryFee ?? 0, {
          maximumFractionDigits: 2,
        });
  const deliveryTime = deliveryTimeLabel(store.deliveryTime, (count) =>
    t("minutes", { count }),
  );
  const distance =
    typeof store.distanceKm === "number" &&
    Number.isFinite(store.distanceKm) &&
    store.distanceKm >= 0
      ? store.distanceKm
      : null;
  const rating =
    typeof store.averageRating === "number" &&
    Number.isFinite(store.averageRating) &&
    store.averageRating > 0
      ? store.averageRating
      : null;
  const reviewCount =
    typeof store.reviewCount === "number" &&
    Number.isFinite(store.reviewCount) &&
    store.reviewCount > 0
      ? store.reviewCount
      : null;
  const hasRatingDetails = Boolean(rating || reviewCount);
  return (
    <Link
      aria-label={t("openStore", { name: store.name })}
      className={`group shrink-0 snap-start overflow-hidden rounded-2xl bg-card shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand ${fluid ? "w-full" : "w-[252px] sm:w-[282px]"}`}
      href={`/restaurants/${encodeURIComponent(store.slug || store.storeId)}`}
    >
      <div className="relative">
        <DeliveryImage
          alt={store.name}
          className="aspect-[16/9] w-full"
          imageClassName="transition-transform duration-500 ease-out group-hover:scale-105"
          sizes="(max-width: 640px) 255px, 282px"
          src={store.coverImage ?? store.logo}
        />
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/65 to-transparent" />
        {offer ? (
          <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-brand px-2.5 py-1 text-[10px] font-bold text-ink shadow-sm">
            <Tag aria-hidden="true" className="size-3" />
            {offer}
          </span>
        ) : null}
        {isClosed ? (
          <span className="absolute inset-0 grid place-items-center bg-black/45">
            <b className="rounded-full bg-surface px-4 py-2 text-[11px] uppercase tracking-[0.12em] text-ink">
              {t("closed")}
            </b>
          </span>
        ) : null}
        {hasRatingDetails && !isClosed ? (
          <span className="absolute bottom-3 left-3 inline-flex items-center gap-1 rounded-full bg-card/95 px-2.5 py-1 text-[10px] font-bold text-ink shadow-sm">
            {rating ? (
              <>
                <Star aria-hidden="true" className="size-3 fill-brand text-brand" />
                {rating.toFixed(1)}
              </>
            ) : null}
            {reviewCount ? (
              <span className="font-medium text-muted">
                ({format.number(reviewCount)})
              </span>
            ) : null}
          </span>
        ) : null}
      </div>

      <div className="p-3.5 sm:p-4">
        <div className="min-w-0">
          <h3 className="truncate font-heading text-[15px] font-bold text-ink">
            {store.name}
          </h3>
          <p className="mt-0.5 truncate text-xs text-muted">
            {store.shopTypeName || store.address || t("storeFallback")}
          </p>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-line pt-3 text-[10px] font-medium text-muted">
          {deliveryTime ? (
            <span className="inline-flex items-center gap-1">
              <Clock3
                aria-hidden="true"
                className="size-3 shrink-0 text-brand"
              />
              {deliveryTime}
            </span>
          ) : null}
          {hasFeeDetails ? (
            <span className="inline-flex items-center gap-1">
              <Bike
                aria-hidden="true"
                className="size-3 shrink-0 text-brand"
              />
              {fee}
            </span>
          ) : null}
          {distance !== null ? (
            <span className="inline-flex items-center gap-1">
              <MapPin
                aria-hidden="true"
                className="size-3 shrink-0 text-brand"
              />
              {t("distance", { distance })}
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
