import { useState } from "react";
import { Clock3, Heart, Info, MapPin, MessageSquareText, Share2, Star } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { useAppCurrencyFormatter } from "@/lib/useAppCurrency";
import { HistoryBackButton } from "@/components/shared/HistoryBackButton";
import { DeliveryImage } from "../discovery/DeliveryImage";
import { RestaurantReviewsModal } from "./RestaurantReviewsModal";
import { RestaurantInfo } from "./RestaurantInfo";
import type { RestaurantStore } from "../../types/restaurant";

function deliveryTime(value: RestaurantStore["deliveryTime"], minutes: (count: number) => string) {
  if (typeof value === "number") return value > 0 ? minutes(value) : null;
  return value?.trim() || null;
}

interface Props {
  isFavouritePending: boolean;
  onShare: () => void;
  onToggleFavourite: () => void;
  store: RestaurantStore;
}

export function RestaurantHero({
  isFavouritePending,
  onShare,
  onToggleFavourite,
  store,
}: Props) {
  const t = useTranslations("deliveries.restaurant");
  const format = useFormatter();
  const formatAppCurrency = useAppCurrencyFormatter();
  const eta = deliveryTime(store.deliveryTime, (count) => t("minutes", { count }));
  const [reviewsOpen, setReviewsOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);

  return (
    <section className="relative isolate min-h-[270px] overflow-hidden bg-ink text-white sm:min-h-[310px]">
      <DeliveryImage
        alt={t("coverAlt", { name: store.name })}
        className="absolute inset-0 size-full rounded-none bg-ink"
        imageClassName="opacity-70"
        sizes="100vw"
        src={store.coverImage ?? store.logo}
      />
      <div className="absolute inset-0 bg-black/45" />
      <div className="relative mx-auto flex min-h-[270px] w-full max-w-[1540px] items-end px-[18px] pb-7 pt-20 sm:min-h-[310px] sm:px-7 sm:pb-9 lg:pl-4 lg:pr-7 xl:pr-9">
        <HistoryBackButton
          className="absolute top-5 sm:top-6"
          href="/discovery"
          variant="inverse"
        />
        <div className="flex w-full items-end gap-4 sm:gap-6">
          <DeliveryImage
            alt={t("logoAlt", { name: store.name })}
            className="hidden size-28 shrink-0 rounded-[26px] border-4 border-white bg-white shadow-pop sm:block lg:size-36"
            contain
            imageClassName="rounded-2xl"
            sizes="144px"
            src={store.logo}
          />
          <div className="min-w-0 flex-1">
            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-white/75">
              {store.shopTypeName || t("restaurantFallback")}
            </p>
            <h1 className="truncate font-heading text-3xl font-bold sm:text-4xl">
              {store.name}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-medium sm:text-sm">
              <button
                aria-label={t("seeReviewsAria", { rating: store.averageRating.toFixed(1), count: store.reviewCount })}
                className="inline-flex items-center gap-1.5 rounded-full underline-offset-4 hover:underline"
                onClick={() => setReviewsOpen(true)}
                type="button"
              >
                <Star aria-hidden="true" className="size-4 fill-[#f8c94f] text-[#f8c94f]" />
                {store.averageRating.toFixed(1)} ({format.number(store.reviewCount)})
              </button>
              {eta ? (
                <span className="inline-flex items-center gap-1.5">
                  <Clock3 aria-hidden="true" className="size-4" />
                  {eta}
                </span>
              ) : null}
              {store.distanceKm !== null ? (
                <span className="inline-flex items-center gap-1.5">
                  <MapPin aria-hidden="true" className="size-4" />
                  {t("distance", { distance: store.distanceKm })}
                </span>
              ) : null}
              <span className="inline-flex items-center gap-2">
                <i className={`size-2 rounded-full ${store.isAvailable ? "bg-emerald-400" : "bg-white/50"}`} />
                {store.isAvailable ? t("open") : t("closed")}
              </span>
              {store.minimumOrder > 0 ? <span className="font-semibold text-white">{t("minimumOrder", { amount: formatAppCurrency(format, store.minimumOrder) })}</span> : null}
            </div>
            <button className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-xl border border-white/55 bg-black/20 px-4 text-sm font-semibold backdrop-blur-sm transition-colors hover:bg-white hover:text-ink md:hidden" onClick={() => setDetailsOpen(true)} type="button"><Info className="size-4" aria-hidden="true" />{t("details")}</button>
          </div>
          <div className="hidden shrink-0 gap-3 md:flex">
            <button className="inline-flex h-11 items-center gap-2 rounded-xl border border-white/55 bg-black/20 px-4 text-sm font-semibold backdrop-blur-sm transition hover:bg-white hover:text-ink" onClick={() => setReviewsOpen(true)} type="button">
              <MessageSquareText aria-hidden="true" className="size-4" />
              {t("seeReviews")}
            </button>
            <button className="inline-flex h-11 items-center gap-2 rounded-xl border border-white/55 bg-black/20 px-4 text-sm font-semibold backdrop-blur-sm transition-colors hover:bg-white hover:text-ink" onClick={() => setDetailsOpen(true)} type="button"><Info aria-hidden="true" className="size-4" />{t("details")}</button>
            <button aria-pressed={store.isFavorited} className="inline-flex h-11 items-center gap-2 rounded-xl border border-white/55 bg-black/20 px-4 text-sm font-semibold backdrop-blur-sm transition hover:bg-white hover:text-ink disabled:opacity-50" disabled={isFavouritePending} onClick={onToggleFavourite} type="button">
              <Heart
                aria-hidden="true"
                className={
                  store.isFavorited
                    ? "size-4 fill-brand text-brand"
                    : "size-4"
                }
              />
              {t("favourite")}
            </button>
            <button className="inline-flex h-11 items-center gap-2 rounded-xl border border-white/55 bg-black/20 px-4 text-sm font-semibold backdrop-blur-sm transition hover:bg-white hover:text-ink" onClick={onShare} type="button">
              <Share2 aria-hidden="true" className="size-4" />
              {t("share")}
            </button>
          </div>
        </div>
      </div>
      {reviewsOpen ? <RestaurantReviewsModal onClose={() => setReviewsOpen(false)} store={store} /> : null}
      {detailsOpen ? <RestaurantInfo onClose={() => setDetailsOpen(false)} store={store} /> : null}
    </section>
  );
}
