"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { ShopTypeCard } from "@/modules/deliveries/components/discovery/ShopTypeCard";
import type { DeliveryShopType } from "@/modules/deliveries/types/discovery";
import styles from "./discovery-cards.module.css";

interface Props {
  items: DeliveryShopType[];
  getItemHref: (item: DeliveryShopType) => string;
}

/** Shows two shop types per view; any extra types scroll horizontally. */
export function ShopTypeCarousel({ items, getItemHref }: Props) {
  const t = useTranslations("deliveries.discovery");
  const trackRef = useRef<HTMLDivElement>(null);
  const [canScrollBack, setCanScrollBack] = useState(false);
  const [canScrollForward, setCanScrollForward] = useState(false);
  const [progress, setProgress] = useState(0);
  const [visibleRatio, setVisibleRatio] = useState(1);

  const syncControls = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const maxScroll = track.scrollWidth - track.clientWidth;
    setCanScrollBack(track.scrollLeft > 4);
    setCanScrollForward(track.scrollLeft < maxScroll - 4);
    setProgress(maxScroll > 0 ? track.scrollLeft / maxScroll : 0);
    setVisibleRatio(
      track.scrollWidth > 0 ? track.clientWidth / track.scrollWidth : 1,
    );
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    syncControls();
    const observer = new ResizeObserver(syncControls);
    observer.observe(track);
    return () => observer.disconnect();
  }, [items, syncControls]);

  function move(direction: -1 | 1) {
    const track = trackRef.current;
    const card = track?.firstElementChild;
    if (!track || !(card instanceof HTMLElement)) return;
    const gap = Number.parseFloat(getComputedStyle(track).columnGap) || 0;
    track.scrollBy({
      behavior: "smooth",
      left: direction * (card.offsetWidth + gap),
    });
  }

  const isScrollable = canScrollBack || canScrollForward;

  return (
    <div className="relative">
      <div
        className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-4 px-4 pb-6 pt-3 [scrollbar-width:none] sm:mx-0 sm:scroll-px-0 sm:gap-4 sm:px-0 [&::-webkit-scrollbar]:hidden"
        onScroll={syncControls}
        ref={trackRef}
      >
        {items.map((item, index) => (
          <div
            className={cn(
              styles.cardEnter,
              "shrink-0 snap-start",
              items.length === 1
                ? "basis-full"
                : "basis-[80%] sm:basis-[calc((100%-1rem)/2)]",
            )}
            key={item.id}
            style={{ "--enter-delay": `${Math.min(index, 3) * 90}ms` } as React.CSSProperties}
          >
            <ShopTypeCard href={getItemHref(item)} index={index} item={item} />
          </div>
        ))}
      </div>

      {isScrollable ? (
        <div className="mt-1 flex items-center gap-3">
          <div aria-hidden="true" className="relative h-1 flex-1 overflow-hidden rounded-full bg-line">
            <span
              className="absolute inset-y-0 rounded-full bg-brand transition-[left] duration-200 ease-out"
              style={{
                left: `${progress * (1 - visibleRatio) * 100}%`,
                width: `${visibleRatio * 100}%`,
              }}
            />
          </div>
          <button
            aria-label={t("previousItems")}
            className="grid size-10 place-items-center rounded-full bg-card text-ink shadow-rail-card ring-1 ring-line transition hover:-translate-x-0.5 hover:text-brand disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            disabled={!canScrollBack}
            onClick={() => move(-1)}
            type="button"
          >
            <ChevronLeft aria-hidden="true" className="size-5" />
          </button>
          <button
            aria-label={t("nextItems")}
            className="grid size-10 place-items-center rounded-full bg-brand text-ink shadow-rail-card transition hover:translate-x-0.5 hover:bg-brand/85 disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            disabled={!canScrollForward}
            onClick={() => move(1)}
            type="button"
          >
            <ChevronRight aria-hidden="true" className="size-5" />
          </button>
        </div>
      ) : null}
    </div>
  );
}
