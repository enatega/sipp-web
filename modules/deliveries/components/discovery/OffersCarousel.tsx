"use client";

import { useEffect, useRef, useState } from "react";
import { OfferPanel } from "./OfferPanel";
import type { DeliveryBanner } from "@/modules/deliveries/types/discovery";
import styles from "./offers-carousel.module.css";

interface Props {
  ctaLabel: string;
  items: DeliveryBanner[];
  label: string;
  nextLabel: string;
  positionLabel: (position: number) => string;
}

export function OffersCarousel({
  ctaLabel,
  items,
  label,
  nextLabel,
  positionLabel,
}: Props) {
  const hasLoop = items.length > 1;
  const touchStartRef = useRef<number | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAutoPlayPaused, setIsAutoPlayPaused] = useState(false);
  const currentIndex = items.length ? activeIndex % items.length : 0;
  const activeBanner = items[currentIndex];
  const nextBanner = hasLoop ? items[(currentIndex + 1) % items.length] : null;

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

  return (
    <section
      aria-label={label}
      className="relative"
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
      <div className={`${hasLoop ? styles.pair : ""} grid overflow-hidden rounded-2xl`}>
        <OfferPanel banner={activeBanner} ctaLabel={ctaLabel} key={activeBanner.id} />
        {nextBanner ? (
          <div className="hidden lg:block" key={nextBanner.id}>
            <OfferPanel banner={nextBanner} ctaLabel={ctaLabel} />
          </div>
        ) : null}
      </div>

      {hasLoop ? (
        <button
          aria-label={`${positionLabel(currentIndex + 1)}. ${nextLabel}`}
          className="absolute bottom-3 right-3 z-20 flex size-14 items-center justify-center whitespace-nowrap rounded-full bg-white text-xs font-bold tabular-nums text-[#142938] shadow-rail-card transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand lg:bottom-auto lg:right-auto lg:left-1/2 lg:top-1/2 lg:size-[72px] lg:-translate-x-1/2 lg:-translate-y-1/2"
          onClick={() => move(1)}
          type="button"
        >
          {String(currentIndex + 1).padStart(2, "0")}
          <span aria-hidden="true" className="px-0.5 text-muted">/</span>
          {String(items.length).padStart(2, "0")}
        </button>
      ) : null}
    </section>
  );
}
