import Link from "next/link";
import { Clock3, Star, Tag } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { useAppCurrencyFormatter } from "@/lib/useAppCurrency";
import { DeliveryImage } from "@/modules/deliveries/components/discovery/DeliveryImage";
import type { DeliveryStore } from "@/modules/deliveries/types/discovery";
import {
  storeDeliveryTimeLabel,
  storeHref,
  storeOfferLabel,
} from "@/modules/deliveries/utils/storeCardLabels";
import { StoreFavouriteButton } from "./StoreFavouriteButton";

export function StoreCard({ store, fluid = false, onOpen }: { store: DeliveryStore; fluid?: boolean; onOpen?: () => void }) {
  const t = useTranslations("deliveries.discovery");
  const format = useFormatter();
  const formatAppCurrency = useAppCurrencyFormatter();
  const isClosed = store.isOpen === false || store.isAvailable === false;
  const offer = storeOfferLabel(
    store,
    (value) => formatAppCurrency(format, value),
    t("off"),
  );
  const deliveryTime = storeDeliveryTimeLabel(store.deliveryTime, (count) =>
    t("minutes", { count }),
  );
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
    <article
      className={`group relative shrink-0 snap-start transition-transform duration-300 ease-out hover:-translate-y-1 ${fluid ? "w-full" : "w-[200px] min-[400px]:w-[224px] sm:w-[282px]"}`}
    >
      <Link
        aria-label={t("openStore", { name: store.name })}
        className="block overflow-hidden rounded-2xl bg-card shadow-rail-card ring-1 ring-line transition-shadow duration-300 group-hover:shadow-pop focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand"
        href={storeHref(store)}
        onClick={onOpen}
      >
        <div className="relative">
          <DeliveryImage
            alt={store.name}
            className="aspect-[16/10] w-full"
            imageClassName="transition-transform duration-500 ease-out group-hover:scale-105"
            sizes="(max-width: 640px) 224px, 282px"
            src={store.coverImage ?? store.logo}
          />
          {offer ? (
            <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-brand px-2 py-0.5 text-[10px] font-bold sm:left-3 sm:top-3 sm:px-2.5 sm:py-1 sm:text-[11px] text-ink shadow-sm">
              <Tag aria-hidden="true" className="size-2.5 sm:size-3" />
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
          {hasRatingDetails ? (
            <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-full bg-card/95 px-2 py-0.5 text-[11px] font-bold sm:bottom-3 sm:left-3 sm:px-2.5 sm:py-1 sm:text-xs text-ink shadow-sm backdrop-blur-sm">
              {rating ? (
                <>
                  <Star aria-hidden="true" className="size-3 fill-rating sm:size-3.5 text-rating" />
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

        <div className="px-3 pb-3 pt-2.5 sm:px-4 sm:pb-4 sm:pt-3">
          <h3 className="truncate font-heading text-sm font-bold text-ink sm:text-base">
            {store.name}
          </h3>
          <p className="mt-0.5 truncate text-xs text-muted sm:text-[13px]">
            {store.shopTypeName || store.address || t("storeFallback")}
          </p>

          {deliveryTime ? (
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-medium text-body sm:mt-3 sm:gap-x-4 sm:gap-y-1.5 sm:text-xs">
              <span className="inline-flex items-center gap-1 sm:gap-1.5">
                <Clock3 aria-hidden="true" className="size-3.5 shrink-0 sm:size-4 text-muted" />
                {deliveryTime}
              </span>
            </div>
          ) : null}
        </div>
      </Link>

      <StoreFavouriteButton
        className="absolute right-2 top-2 z-10 size-8 sm:right-3 sm:top-3 sm:size-9"
        isFavorite={store.isFavorite === true}
        name={store.name}
        storeId={store.storeId}
      />
    </article>
  );
}
