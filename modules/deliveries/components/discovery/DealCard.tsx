import Link from "next/link";
import { ArrowRight, Bike, Clock3, Heart, Star } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { formatAppCurrency } from "@/config/currency";
import { cn } from "@/lib/utils";
import { DeliveryImage } from "@/modules/deliveries/components/discovery/DeliveryImage";
import type { DeliveryStore } from "@/modules/deliveries/types/discovery";
import {
  storeDeliveryTimeLabel,
  storeHref,
  storeOfferLabel,
} from "@/modules/deliveries/utils/storeCardLabels";
import styles from "./discovery-cards.module.css";

interface Props {
  store: DeliveryStore;
  /** `wide` fills its grid cell with a side-by-side layout. */
  layout?: "rail" | "wide";
}

export function DealCard({ store, layout = "rail" }: Props) {
  const t = useTranslations("deliveries.discovery");
  const format = useFormatter();
  const isWide = layout === "wide";
  const isClosed = store.isOpen === false || store.isAvailable === false;
  const offer = storeOfferLabel(
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
  const deliveryTime = storeDeliveryTimeLabel(store.deliveryTime, (count) =>
    t("minutes", { count }),
  );
  const rating =
    typeof store.averageRating === "number" &&
    Number.isFinite(store.averageRating) &&
    store.averageRating > 0
      ? store.averageRating
      : null;
  const price =
    typeof store.price === "number" && store.price >= 0 ? store.price : null;
  const discountedPrice =
    price !== null && typeof store.discountedPrice === "number"
      ? store.discountedPrice
      : null;
  const minimumOrder =
    typeof store.minimumOrder === "number" && store.minimumOrder > 0
      ? store.minimumOrder
      : null;
  // A named deal ("Holiday Deal") leads; the store becomes the byline.
  const dealName = store.deal?.trim() || null;
  const title = dealName ?? store.name;
  const byline = dealName ? store.name.trim() : null;
  const category = store.shopTypeName?.trim() || t("storeFallback");
  const hasMeta = Boolean(rating || deliveryTime || hasFeeDetails);

  return (
    <Link
      aria-label={t("openStore", { name: store.name })}
      className={cn(
        "group relative flex h-full overflow-hidden rounded-[1.35rem] bg-card p-1.5 shadow-rail-card ring-1 ring-line transition-[translate,box-shadow] duration-300 ease-out hover:-translate-y-1 hover:shadow-pop hover:ring-brand/40 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand",
        isWide
          ? "w-full flex-row"
          : "w-[204px] shrink-0 snap-start flex-col sm:w-[228px]",
      )}
      href={storeHref(store)}
    >
      <div
        className={cn(
          "relative shrink-0 overflow-hidden rounded-2xl",
          isWide && "w-32 self-stretch sm:w-44",
        )}
      >
        <DeliveryImage
          alt={store.name}
          className={cn(
            "aspect-[16/10] w-full",
            isWide && "aspect-auto h-full min-h-32",
            isClosed && "grayscale",
          )}
          imageClassName="transition-[scale] duration-700 ease-out group-hover:scale-110"
          sizes={isWide ? "(max-width: 560px) 128px, 176px" : "(max-width: 560px) 204px, 228px"}
          src={store.coverImage ?? store.logo}
        />
        <span aria-hidden="true" className={styles.shine} />
        {offer ? (
          <span className="absolute left-2 top-2 z-2 max-w-[calc(100%-1rem)] -rotate-3 truncate rounded-lg bg-secondary px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wide text-white shadow-sm transition-[scale,rotate] duration-300 group-hover:rotate-0 group-hover:scale-105">
            {offer}
          </span>
        ) : null}
        {store.isFavorite ? (
          <span className="absolute bottom-2 right-2 z-2 grid size-7 place-items-center rounded-full bg-card/95 text-secondary shadow-sm">
            <Heart aria-hidden="true" className="size-3.5 fill-current" />
          </span>
        ) : null}
        {isClosed ? (
          <span className="absolute inset-0 z-2 grid place-items-center bg-black/45">
            <b className="rounded-full bg-surface px-3 py-1.5 text-[10px] uppercase tracking-[0.12em] text-ink">
              {t("closed")}
            </b>
          </span>
        ) : null}
      </div>

      <div
        className={cn(
          "flex min-w-0 flex-1 flex-col",
          isWide
            ? "@container justify-center px-3 py-2 sm:px-4"
            : "px-1.5 pb-0.5 pt-2.5",
        )}
      >
        <div
          className={cn(
            "flex min-w-0 flex-1 flex-col",
            isWide && "justify-center gap-2.5 @lg:flex-row @lg:items-center @lg:justify-between @lg:gap-6",
          )}
        >
          <div className="min-w-0">
            <span className="block truncate text-[10px] font-bold uppercase tracking-[0.12em] text-muted">
              {category}
            </span>
            <h3
              className={cn(
                "mt-0.5 truncate font-heading font-extrabold tracking-[-0.01em] text-ink",
                isWide ? "text-base sm:text-lg" : "text-[15px]",
              )}
            >
              {title}
            </h3>
            {byline ? (
              <p className="truncate text-xs text-muted">{byline}</p>
            ) : null}
            {hasMeta ? (
              <div className="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] font-semibold text-body">
                {rating ? (
                  <span className="inline-flex items-center gap-1">
                    <Star aria-hidden="true" className="size-3 fill-brand text-brand" />
                    {rating.toFixed(1)}
                  </span>
                ) : null}
                {deliveryTime ? (
                  <span className="inline-flex items-center gap-1">
                    <Clock3 aria-hidden="true" className="size-3 text-brand" />
                    {deliveryTime}
                  </span>
                ) : null}
                {hasFeeDetails ? (
                  <span className="inline-flex items-center gap-1">
                    <Bike aria-hidden="true" className="size-3 text-brand" />
                    {fee}
                  </span>
                ) : null}
              </div>
            ) : null}
          </div>

          <div
            className={cn(
              "flex items-center justify-between gap-2",
              isWide ? "@lg:shrink-0 @lg:justify-end @lg:gap-4" : "mt-auto pt-2.5",
            )}
          >
            {price !== null ? (
              <p className="flex min-w-0 flex-wrap items-baseline gap-x-2 tabular-nums">
                <b className={cn("font-heading font-extrabold text-ink", isWide ? "text-xl" : "text-lg")}>
                  {formatAppCurrency(format, discountedPrice ?? price)}
                </b>
                {discountedPrice !== null ? (
                  <s className="text-xs font-medium text-muted decoration-secondary/70">
                    {formatAppCurrency(format, price)}
                  </s>
                ) : null}
              </p>
            ) : minimumOrder !== null ? (
              <p className="min-w-0 text-xs text-muted">
                {t.rich("minimumOrder", {
                  amount: () => (
                    <b className="font-heading text-sm font-extrabold text-ink tabular-nums">
                      {formatAppCurrency(format, minimumOrder)}
                    </b>
                  ),
                })}
              </p>
            ) : (
              <span className="min-w-0 truncate text-xs font-bold text-brand">
                {t("exploreOffer")}
              </span>
            )}
            <span
              aria-hidden="true"
              className="grid size-8 shrink-0 place-items-center rounded-full bg-brand text-ink shadow-sm transition-[scale,rotate] duration-300 group-hover:-rotate-12 group-hover:scale-110"
            >
              <ArrowRight className="size-4" strokeWidth={2.6} />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
