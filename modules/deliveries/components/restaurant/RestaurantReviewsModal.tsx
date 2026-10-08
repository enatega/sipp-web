"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { LoaderCircle, MessageSquareQuote, Star, X } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { DeliveryImage } from "../discovery/DeliveryImage";
import { RestaurantReviewCard } from "./RestaurantReviewCard";
import { STAR_FILL, StarRating } from "./StarRating";
import { useRestaurantReviewsQuery } from "../../hooks/useRestaurantQueries";
import type { RestaurantStore, ReviewStar } from "../../types/restaurant";

const STARS: ReviewStar[] = [5, 4, 3, 2, 1];
function verdictKey(rating: number) {
  if (rating >= 4.5) return "excellent";
  if (rating >= 4) return "veryGood";
  if (rating >= 3) return "good";
  if (rating >= 2) return "fair";
  return "poor";
}

interface Props {
  onClose: () => void;
  store: RestaurantStore;
}

export function RestaurantReviewsModal({ onClose, store }: Props) {
  const t = useTranslations("deliveries.restaurant");
  const format = useFormatter();
  const [rating, setRating] = useState<ReviewStar | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const overview = useRestaurantReviewsQuery(store.id, null, true);
  const filtered = useRestaurantReviewsQuery(store.id, rating, rating !== null);
  const list = rating === null ? overview : filtered;

  const summary = overview.data?.pages[0];
  const reviews = useMemo(() => list.data?.pages.flatMap((page) => page.items) ?? [], [list.data]);
  const average = summary?.averageRating ?? 0;
  const total = summary?.totalReviews ?? 0;
  const maxCount = summary ? Math.max(1, ...STARS.map((star) => summary.distribution[star])) : 1;

  const onCloseRef = useRef(onClose);
  useEffect(() => { onCloseRef.current = onClose; }, [onClose]);

  useEffect(() => {
    closeRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") onCloseRef.current(); };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  return createPortal(
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center bg-black/55 backdrop-blur-[2px] sm:items-center sm:p-5"
      onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}
    >
      <section
        aria-labelledby="restaurant-reviews-title"
        aria-modal="true"
        role="dialog"
        className="flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-[28px] border border-line bg-surface shadow-[0_30px_80px_rgba(15,10,20,0.35)] sm:max-h-[86vh] sm:max-w-2xl sm:rounded-[28px]"
      >
        <header className="relative shrink-0 overflow-hidden bg-[linear-gradient(135deg,color-mix(in_srgb,var(--color-brand)_16%,var(--card)),var(--card)_70%)] px-5 pb-5 pt-5 sm:px-7 sm:pt-6">
          <Star aria-hidden="true" className={cn("pointer-events-none absolute -right-6 -top-8 size-40 rotate-12 opacity-[0.12]", STAR_FILL)} />
          <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-line sm:hidden" />
          <div className="relative flex items-center gap-3">
            <DeliveryImage
              alt=""
              className="size-11 shrink-0 rounded-xl border border-line bg-white"
              contain
              imageClassName="rounded-lg p-0.5"
              sizes="44px"
              src={store.logo}
            />
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-brand">{t("reviewsEyebrow")}</p>
              <h2 id="restaurant-reviews-title" className="truncate text-lg font-bold text-ink sm:text-xl">{store.name}</h2>
            </div>
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              aria-label={t("reviewsClose")}
              className="grid size-10 shrink-0 place-items-center rounded-full bg-card/80 text-body transition-colors hover:bg-card hover:text-ink"
            >
              <X aria-hidden="true" className="size-5" />
            </button>
          </div>

          {summary ? <div className="relative mt-5 grid gap-5 sm:grid-cols-[180px_minmax(0,1fr)] sm:items-center">
            <div className="flex items-center gap-4 sm:block">
              <p className="font-heading text-5xl font-bold leading-none text-ink tabular-nums">{format.number(average, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}</p>
              <div className="sm:mt-2">
                <StarRating rating={average} starClassName="size-4" />
                <span className="sr-only">{t("reviewStarsAria", { rating: average })}</span>
                {total > 0 ? (
                  <p className="mt-1 text-xs text-muted">
                    <span className="me-1.5 inline-flex rounded-full bg-[#f8c94f]/20 px-2 py-0.5 font-bold text-gold">{t(`reviewVerdict.${verdictKey(average)}`)}</span>
                    {t("reviewsBasedOn", { count: total })}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="space-y-1.5" role="group" aria-label={t("reviewsFilterLabel")}>
              {STARS.map((star) => {
                const count = summary?.distribution[star] ?? 0;
                const selected = rating === star;
                return (
                  <button
                    key={star}
                    type="button"
                    disabled={!count}
                    aria-pressed={selected}
                    onClick={() => setRating(selected ? null : star)}
                    className={cn(
                      "group flex w-full items-center gap-2.5 rounded-lg px-2 py-1 text-xs transition-colors disabled:cursor-default",
                      selected ? "bg-brand/12 text-ink" : "text-body enabled:hover:bg-card/70",
                    )}
                  >
                    <span className="inline-flex w-7 items-center justify-end gap-0.5 font-semibold tabular-nums">
                      {star}<Star aria-hidden="true" className={cn("size-3", STAR_FILL)} />
                    </span>
                    <span className="relative h-2 flex-1 overflow-hidden rounded-full bg-line/70">
                      <span
                        className={cn("absolute inset-y-0 left-0 rounded-full transition-[width] duration-500 rtl:left-auto rtl:right-0", selected ? "bg-brand" : "bg-brand/70 group-enabled:group-hover:bg-brand")}
                        style={{ width: `${(count / maxCount) * 100}%` }}
                      />
                    </span>
                    <span className="w-7 text-end tabular-nums text-muted">{format.number(count)}</span>
                  </button>
                );
              })}
            </div>
          </div> : <p className="relative mt-5 text-sm text-body">
            {overview.isPending ? t("reviewsLoading") : t("reviewsErrorMessage")}
          </p>}
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-6 pt-4 sm:px-7">
          {rating !== null ? (
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-ink">{t("reviewsShowingStars", { count: rating })}</p>
              <button type="button" onClick={() => setRating(null)} className="rounded-full px-3 py-1.5 text-xs font-semibold text-brand hover:bg-brand/10">{t("reviewsShowAll")}</button>
            </div>
          ) : null}

          {list.isPending ? (
            <div className="space-y-3" aria-busy="true">
              {[0, 1, 2].map((key) => (
                <div key={key} className="animate-pulse rounded-2xl border border-line bg-card p-5">
                  <div className="flex items-center gap-3"><span className="size-10 rounded-full bg-soft-surface" /><span className="h-3 w-32 rounded bg-soft-surface" /></div>
                  <span className="mt-4 block h-3 w-full rounded bg-soft-surface" />
                  <span className="mt-2 block h-3 w-2/3 rounded bg-soft-surface" />
                </div>
              ))}
            </div>
          ) : list.isError ? (
            <div className="py-10 text-center">
              <p className="font-bold text-ink">{t("reviewsErrorTitle")}</p>
              <p className="mt-1 text-sm text-body">{t("reviewsErrorMessage")}</p>
              <button type="button" onClick={() => void list.refetch()} className="mt-4 rounded-full bg-brand px-5 py-2.5 text-sm font-bold text-ink hover:bg-brand/85">{t("retry")}</button>
            </div>
          ) : reviews.length === 0 ? (
            <div className="py-10 text-center">
              <span className="mx-auto grid size-16 place-items-center rounded-[22px] bg-brand/10 text-brand">
                <MessageSquareQuote aria-hidden="true" className="size-7" />
              </span>
              <p className="mt-4 font-bold text-ink">{t("reviewsEmptyTitle")}</p>
              <p className="mx-auto mt-1 max-w-xs text-sm text-body">{t("reviewsEmptyMessage", { name: store.name })}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {reviews.map((review) => <RestaurantReviewCard key={review.id} review={review} />)}
              {list.hasNextPage ? (
                <button
                  type="button"
                  disabled={list.isFetchingNextPage}
                  onClick={() => void list.fetchNextPage()}
                  className="mt-2 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-line bg-card text-sm font-semibold text-ink transition-colors hover:border-brand/40 hover:text-brand disabled:opacity-60"
                >
                  {list.isFetchingNextPage ? <LoaderCircle aria-hidden="true" className="size-4 animate-spin" /> : null}
                  {t("reviewsLoadMore")}
                </button>
              ) : null}
            </div>
          )}
        </div>
      </section>
    </div>,
    document.body,
  );
}
