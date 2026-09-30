"use client";

import Link from "next/link";
import { ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { BannerMedia } from "@/modules/deliveries/components/discovery/BannerMedia";
import type { DeliveryBanner } from "@/modules/deliveries/types/discovery";
import styles from "./discovery-transitions.module.css";

function bannerHref(banner: DeliveryBanner) {
  if (banner.actionType === "store") {
    const storeId = banner.relatedStore?.trim() || banner.store?.id?.trim();
    return storeId ? `/restaurants/${encodeURIComponent(storeId)}` : null;
  }
  if (banner.actionType === "product") {
    const storeId = banner.product?.storeId?.trim();
    const productId = banner.relatedProduct?.trim() || banner.product?.id?.trim();
    return storeId && productId
      ? `/restaurants/${encodeURIComponent(storeId)}?productId=${encodeURIComponent(productId)}`
      : null;
  }
  if (banner.actionType === "shop_type" || banner.actionType === "all_restaurants") {
    const shopTypeId =
      banner.relatedShopType?.trim() || banner.shopType?.id?.trim();
    return shopTypeId
      ? `/discovery/all/stores?shopTypeId=${encodeURIComponent(shopTypeId)}&title=${encodeURIComponent(banner.shopType?.name?.trim() || banner.title?.trim() || "Stores")}`
      : null;
  }
  return null;
}

interface Props {
  ctaLabel: string;
  items: DeliveryBanner[];
  label: string;
  previousLabel: string;
  nextLabel: string;
  positionLabel: (position: number) => string;
}

export function OffersCarousel({
  ctaLabel,
  items,
  label,
  previousLabel,
  nextLabel,
  positionLabel,
}: Props) {
  const hasLoop = items.length > 1;
  const touchStartRef = useRef<number | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAutoPlayPaused, setIsAutoPlayPaused] = useState(false);
  const activeBanner = items[activeIndex];
  const nextIndex = hasLoop ? (activeIndex + 1) % items.length : activeIndex;
  const nextBanner = items[nextIndex];

  useEffect(() => {
    if (
      !hasLoop ||
      isAutoPlayPaused ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }
    const timer = window.setTimeout(() => {
      setActiveIndex((current) => (current + 1) % items.length);
    }, 5000);
    return () => window.clearTimeout(timer);
  }, [hasLoop, isAutoPlayPaused, activeIndex, items.length]);

  if (!activeBanner) return null;

  function move(direction: -1 | 1) {
    if (!hasLoop) return;
    setActiveIndex(
      (current) => (current + direction + items.length) % items.length,
    );
  }

  function showSlide(index: number) {
    setActiveIndex(index);
  }

  const activeHref = bannerHref(activeBanner);
  const activeHasCopy = Boolean(activeBanner.title?.trim() || activeBanner.description?.trim());
  const nextHasCopy = Boolean(nextBanner.title?.trim() || nextBanner.description?.trim());
  const feature = (
    <article
      className={`${styles.featuredEnter} group relative overflow-hidden rounded-2xl bg-brand text-ink shadow-sm ${activeHasCopy ? "min-h-[320px] sm:min-h-[380px] lg:min-h-[410px]" : "aspect-[3/1]"}`}
      key={activeBanner.id}
    >
      <BannerMedia banner={activeBanner} />
      {activeHasCopy ? <><div className="absolute inset-0 bg-gradient-to-r from-black/88 via-black/46 to-black/10" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/55 to-transparent" />
      <div className="relative flex min-h-[320px] max-w-[37rem] flex-col justify-end px-6 pb-12 pt-7 sm:min-h-[380px] sm:px-9 sm:pb-14 lg:min-h-[410px] lg:px-11">
        {activeBanner.title?.trim() ? <h2 className="text-balance font-heading text-[2rem] font-extrabold leading-[1.04] tracking-[-0.04em] sm:text-[2.7rem] lg:text-5xl text-white">
          {activeBanner.title}
        </h2> : null}
        {activeBanner.description ? (
          <p className="mt-3 line-clamp-2 max-w-lg text-sm leading-6 text-white/85 sm:text-base">
            {activeBanner.description}
          </p>
        ) : null}
        {activeHref ? (
          <span className="mt-5 inline-flex min-h-11 w-fit items-center gap-2 rounded-full bg-white px-5 py-2.5 text-xs font-bold text-brand transition-transform duration-300 group-hover:translate-x-1 sm:text-sm">
            {ctaLabel}
            <ArrowUpRight aria-hidden="true" className="size-4" />
          </span>
        ) : null}
      </div></> : null}
    </article>
  );

  return (
    <section
      aria-label={label}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setIsAutoPlayPaused(false);
        }
      }}
      onFocus={() => setIsAutoPlayPaused(true)}
      onMouseEnter={() => setIsAutoPlayPaused(true)}
      onMouseLeave={() => setIsAutoPlayPaused(false)}
      onTouchEnd={(event) => {
        const start = touchStartRef.current;
        touchStartRef.current = null;
        setIsAutoPlayPaused(false);
        if (start === null) return;
        const distance = event.changedTouches[0].clientX - start;
        if (Math.abs(distance) > 42) move(distance > 0 ? -1 : 1);
      }}
      onTouchStart={(event) => {
        touchStartRef.current = event.touches[0].clientX;
        setIsAutoPlayPaused(true);
      }}
    >
      <div className={hasLoop ? "md:grid md:grid-cols-[minmax(0,1.7fr)_minmax(250px,0.78fr)] md:gap-4" : undefined}>
        <div className="relative min-w-0">
          {activeHref ? (
            <Link
              className="block min-w-0 focus-visible:rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-brand"
              href={activeHref}
            >
              {feature}
            </Link>
          ) : (
            feature
          )}
          {hasLoop ? (
            <div className="absolute inset-x-6 bottom-5 flex gap-1.5 sm:inset-x-9 lg:inset-x-11">
              {items.map((banner, index) => (
                <button
                  aria-label={positionLabel(index + 1)}
                  className="relative h-1.5 min-w-5 flex-1 overflow-hidden rounded-full bg-white/35 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-white"
                  key={banner.id}
                  onClick={() => showSlide(index)}
                  type="button"
                >
                  {index === activeIndex ? (
                    <span
                      className={`${styles.offerProgress} ${isAutoPlayPaused ? styles.offerProgressPaused : ""} absolute inset-y-0 left-0 rounded-full bg-white`}
                    />
                  ) : null}
                </button>
              ))}
            </div>
          ) : null}
        </div>

        {hasLoop ? (
          <button
            aria-label={nextLabel}
            className={`${styles.previewEnter} group relative my-6 hidden overflow-hidden rounded-2xl bg-brand text-left text-ink shadow-sm focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-brand md:block lg:my-7 ${nextHasCopy ? "min-h-[332px] lg:min-h-[354px]" : "aspect-[3/1]"}`}
            key={`preview-${nextBanner.id}`}
            onClick={() => move(1)}
            type="button"
          >
            <BannerMedia banner={nextBanner} />
            {nextHasCopy ? <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/18 to-black/5" /> : null}
            {nextHasCopy ? <span className="absolute right-4 top-4 grid size-11 place-items-center rounded-full bg-card text-brand shadow-sm transition-transform duration-300 group-hover:translate-x-1">
              <ArrowUpRight aria-hidden="true" className="size-5" />
            </span> : null}
            {nextHasCopy ? <span className="absolute inset-x-5 bottom-5">
              <strong className="line-clamp-2 block font-heading text-xl font-bold leading-6">
                {nextBanner.title}
              </strong>
              {nextBanner.description ? (
                <small className="mt-2 line-clamp-2 block text-xs leading-5 text-white/75">
                  {nextBanner.description}
                </small>
              ) : null}
            </span> : null}
          </button>
        ) : null}
      </div>

      {hasLoop ? (
        <div className="mt-3 flex items-center gap-3">
          <span className="text-xs font-semibold tabular-nums text-muted">
            {String(activeIndex + 1).padStart(2, "0")} /{" "}
            {String(items.length).padStart(2, "0")}
          </span>
          <div className="h-px flex-1 bg-line" />
          <button
            aria-label={previousLabel}
            className="grid size-11 place-items-center rounded-full bg-card text-ink shadow-sm transition hover:-translate-x-0.5 hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            onClick={() => move(-1)}
            type="button"
          >
            <ChevronLeft aria-hidden="true" className="size-5" />
          </button>
          <button
            aria-label={nextLabel}
            className="grid size-11 place-items-center rounded-full bg-brand text-ink shadow-sm transition hover:translate-x-0.5 hover:bg-brand/85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            onClick={() => move(1)}
            type="button"
          >
            <ChevronRight aria-hidden="true" className="size-5" />
          </button>
        </div>
      ) : null}
    </section>
  );
}
