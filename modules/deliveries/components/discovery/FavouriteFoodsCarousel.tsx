"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { getLocalizedProductName } from "@/modules/deliveries/utils/productTranslation";
import { useFavouriteFoodsQuery } from "@/modules/deliveries/hooks/useFavouriteFoodsQueries";
import { FavouriteFoodsSkeleton } from "./skeletons/FavouriteFoodsSkeleton";
import { DeliveryImage } from "./DeliveryImage";
import styles from "./favourite-foods.module.css";

interface Props {
  shopTypeId?: string;
}

export function FavouriteFoodsCarousel({ shopTypeId }: Props) {
  const t = useTranslations("deliveries.favouriteFoods");
  const locale = useLocale();
  const foods = useFavouriteFoodsQuery();
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const directionRef = useRef<1 | -1>(1);
  const pauseUntilRef = useRef(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const [scrollState, setScrollState] = useState({ canBack: false, canForward: false });

  const syncScroll = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const remaining = track.scrollWidth - track.clientWidth;
    setScrollState({ canBack: track.scrollLeft > 3, canForward: track.scrollLeft < remaining - 3 });
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;
    const visibility = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.35 },
    );
    const resize = new ResizeObserver(syncScroll);
    visibility.observe(section);
    resize.observe(track);
    syncScroll();
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onMotionChange = () => setIsReducedMotion(media.matches);
    onMotionChange();
    media.addEventListener("change", onMotionChange);
    return () => {
      visibility.disconnect();
      resize.disconnect();
      media.removeEventListener("change", onMotionChange);
    };
  }, [foods.data, syncScroll]);

  const move = useCallback((direction: -1 | 1) => {
    const track = trackRef.current;
    const card = track?.firstElementChild;
    if (!track || !(card instanceof HTMLElement)) return;
    const gap = Number.parseFloat(getComputedStyle(track).columnGap) || 0;
    track.scrollBy({ left: direction * (card.offsetWidth + gap), behavior: isReducedMotion ? "instant" : "smooth" });
  }, [isReducedMotion]);

  useEffect(() => {
    if (!isVisible || isPaused || isReducedMotion || !scrollState.canForward && !scrollState.canBack) return;
    const timer = window.setInterval(() => {
      if (document.hidden || Date.now() < pauseUntilRef.current) return;
      const direction = directionRef.current;
      if (direction === 1 && !scrollState.canForward) directionRef.current = -1;
      if (direction === -1 && !scrollState.canBack) directionRef.current = 1;
      move(directionRef.current);
    }, 4200);
    return () => window.clearInterval(timer);
  }, [isVisible, isPaused, isReducedMotion, scrollState, move]);

  if (foods.isPending) {
    return <FavouriteFoodsSkeleton />;
  }

  if (foods.isError) {
    return <div className="flex items-center justify-center gap-3 py-4 text-sm text-muted"><span>{t("loadError")}</span><button className="inline-flex min-h-10 items-center gap-1.5 rounded-full px-3 font-semibold text-brand hover:bg-brand-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand" onClick={() => void foods.refetch()} type="button"><RotateCcw aria-hidden="true" className="size-4" />{t("retry")}</button></div>;
  }

  const visibleFoods = shopTypeId
    ? foods.data?.filter((food) => food.shopTypeIds.includes(shopTypeId))
    : foods.data;
  if (!visibleFoods?.length) return null;

  const isScrollable = scrollState.canBack || scrollState.canForward;
  const manualMove = (direction: -1 | 1) => {
    pauseUntilRef.current = Date.now() + 8000;
    directionRef.current = direction;
    move(direction);
  };

  return (
    <section
      aria-label={t("browse")}
      className="relative"
      onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setIsPaused(false); }}
      onFocus={() => setIsPaused(true)}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => { pauseUntilRef.current = Date.now() + 8000; }}
      ref={sectionRef}
    >
      <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto py-2 [scrollbar-width:none] sm:gap-4 [&::-webkit-scrollbar]:hidden" dir="ltr" onScroll={syncScroll} ref={trackRef}>
        {visibleFoods.map((food) => {
          const name = getLocalizedProductName(food, locale);
          return (
            <Link
              aria-label={t("open", { name })}
              className={`${styles.item} group flex snap-start flex-col overflow-hidden rounded-xl bg-card ring-1 ring-line transition-colors hover:ring-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand`}
              href={`/discovery/favourite-foods/${encodeURIComponent(food.id)}${shopTypeId ? `?shopTypeId=${encodeURIComponent(shopTypeId)}` : ""}`}
              key={food.id}
            >
              <DeliveryImage
                alt=""
                className="min-h-0 w-full flex-1 bg-brand-soft"
                imageClassName="scale-[1.25] transition-transform duration-300 group-hover:scale-[1.3] motion-reduce:transition-none"
                sizes="(max-width: 560px) 50vw, (max-width: 1100px) 25vw, (max-width: 1535px) 17vw, 13vw"
                src={food.imageUrl}
              />
              <span className="flex h-12 shrink-0 items-center bg-card px-3 text-sm font-bold leading-snug text-ink transition-colors group-hover:text-brand">
                <span className="line-clamp-2" dir="auto">{name}</span>
              </span>
            </Link>
          );
        })}
      </div>
      {isScrollable ? (
        <div className="mt-1 flex justify-end gap-2">
          <button aria-label={t("previous")} className="grid size-10 place-items-center rounded-lg bg-card text-ink shadow-sm ring-1 ring-line transition-colors hover:bg-brand-soft disabled:cursor-not-allowed disabled:opacity-35 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand" disabled={!scrollState.canBack} onClick={() => manualMove(-1)} type="button"><ChevronLeft aria-hidden="true" className="size-5" /></button>
          <button aria-label={t("next")} className="grid size-10 place-items-center rounded-lg bg-brand text-ink shadow-sm transition-colors hover:bg-brand/85 disabled:cursor-not-allowed disabled:opacity-35 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand" disabled={!scrollState.canForward} onClick={() => manualMove(1)} type="button"><ChevronRight aria-hidden="true" className="size-5" /></button>
        </div>
      ) : null}
    </section>
  );
}
