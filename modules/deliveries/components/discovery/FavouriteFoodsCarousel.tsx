"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { getLocalizedProductName } from "@/modules/deliveries/utils/productTranslation";
import { useFavouriteFoodsQuery } from "@/modules/deliveries/hooks/useFavouriteFoodsQueries";
import { DeliveryImage } from "./DeliveryImage";

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
    return <div aria-busy="true" className="flex gap-5 overflow-hidden py-3 sm:gap-8">{Array.from({ length: 8 }, (_, index) => <div aria-hidden="true" className="w-[calc((100%-2.5rem)/3)] shrink-0 space-y-3 sm:w-[calc((100%-6rem)/4)] lg:w-[calc((100%-10rem)/6)] xl:w-[calc((100%-14rem)/8)]" key={index}><div className="mx-auto aspect-square w-full max-w-40 animate-pulse rounded-full bg-brand-soft ring-1 ring-line"><div className="m-[18%] h-[64%] w-[64%] rounded-full bg-brand/15" /></div><div className="mx-auto h-4 w-2/3 animate-pulse rounded-full bg-line" /></div>)}</div>;
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
      <div className="flex snap-x snap-mandatory gap-5 overflow-x-auto py-3 [scrollbar-width:none] sm:gap-8 [&::-webkit-scrollbar]:hidden" dir="ltr" onScroll={syncScroll} ref={trackRef}>
        {visibleFoods.map((food) => {
          const name = getLocalizedProductName(food, locale);
          return (
            <Link
              aria-label={t("open", { name })}
              className="group flex w-[calc((100%-2.5rem)/3)] shrink-0 snap-start flex-col items-center gap-3 rounded-2xl text-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand sm:w-[calc((100%-6rem)/4)] lg:w-[calc((100%-10rem)/6)] xl:w-[calc((100%-14rem)/8)]"
              href={`/discovery/favourite-foods/${encodeURIComponent(food.id)}${shopTypeId ? `?shopTypeId=${encodeURIComponent(shopTypeId)}` : ""}`}
              key={food.id}
            >
              <DeliveryImage
                alt=""
                className="mx-auto aspect-square w-full max-w-40 rounded-full bg-brand-soft shadow-[0_8px_22px_-12px_rgba(16,24,40,0.24)] ring-1 ring-line transition-[box-shadow,transform] duration-500 ease-out group-hover:-translate-y-0.5 group-hover:shadow-[0_13px_26px_-12px_rgba(16,24,40,0.25)] group-focus-visible:ring-brand motion-reduce:transition-none"
                imageClassName="transition-transform duration-500 ease-out group-hover:scale-[1.03] motion-reduce:transition-none"
                sizes="(max-width: 640px) 112px, 160px"
                src={food.imageUrl}
              />
              <span className="line-clamp-2 max-w-full text-sm font-bold leading-snug text-ink transition-colors group-hover:text-brand sm:text-[15px]" dir="auto">{name}</span>
            </Link>
          );
        })}
      </div>
      {isScrollable ? (
        <div className="mt-1 flex justify-end gap-2">
          <button aria-label={t("previous")} className="grid size-10 place-items-center rounded-full bg-card text-ink shadow-sm ring-1 ring-line transition-colors hover:bg-brand-soft disabled:cursor-not-allowed disabled:opacity-35 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand" disabled={!scrollState.canBack} onClick={() => manualMove(-1)} type="button"><ChevronLeft aria-hidden="true" className="size-5" /></button>
          <button aria-label={t("next")} className="grid size-10 place-items-center rounded-full bg-brand text-ink shadow-sm transition-colors hover:bg-brand/85 disabled:cursor-not-allowed disabled:opacity-35 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand" disabled={!scrollState.canForward} onClick={() => manualMove(1)} type="button"><ChevronRight aria-hidden="true" className="size-5" /></button>
        </div>
      ) : null}
    </section>
  );
}
