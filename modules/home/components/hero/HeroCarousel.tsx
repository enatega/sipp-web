"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import styles from "@/modules/home/styles/home.module.css";

export type CarouselItem = {
  id: string;
  /** Accessible name for this slide's pagination dot. */
  name: string;
  /** ms the slide holds before the carousel advances. */
  hold: number;
  node: ReactNode;
};

const SWIPE_THRESHOLD = 45;

/**
 * Carousel mechanics only — autoplay, pause, swipe, dots and the crossfade.
 * It knows nothing about what a slide contains, so slide-level animation can
 * change without touching anything in here (and vice versa).
 *
 * Every slide stays mounted and the slides are stacked in one grid cell, so
 * the hero is always as tall as its tallest slide: nothing below it moves as
 * the carousel runs.
 */
export function HeroCarousel({ items }: { items: CarouselItem[] }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchX = useRef<number | null>(null);

  const go = useCallback(
    (index: number) => setActive(((index % items.length) + items.length) % items.length),
    [items.length],
  );

  useEffect(() => {
    if (paused || items.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const timer = window.setTimeout(
      () => setActive((current) => (current + 1) % items.length),
      items[active].hold,
    );
    return () => window.clearTimeout(timer);
  }, [active, paused, items]);

  /* A backgrounded tab would otherwise burn through every slide unseen. */
  useEffect(() => {
    const onVisibility = () => setPaused(document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  return (
    <div
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      onTouchStart={(event) => {
        touchX.current = event.touches[0].clientX;
      }}
      onTouchEnd={(event) => {
        const start = touchX.current;
        touchX.current = null;
        if (start === null) return;
        const delta = event.changedTouches[0].clientX - start;
        if (Math.abs(delta) > SWIPE_THRESHOLD) go(active + (delta < 0 ? 1 : -1));
      }}
    >
      {/* An explicit single track: an implicit `auto` track would size to the
          widest slide's max-content and overflow narrow viewports. */}
      <div
        className="grid grid-cols-1"
        aria-live="off"
        aria-roledescription="carousel"
        aria-label="SIPP services"
      >
        {items.map((item, index) => (
          <div
            key={item.id}
            className={styles.heroSlide}
            data-active={index === active}
            aria-hidden={index !== active}
            inert={index !== active}
            role="group"
            aria-roledescription="slide"
            aria-label={`${index + 1} of ${items.length}: ${item.name}`}
          >
            {item.node}
          </div>
        ))}
      </div>

      <div className={cn(styles.heroDots, "mt-5 flex justify-center gap-2.5 md:mt-8")}>
        {items.map((item, index) => (
          <button
            key={item.id}
            type="button"
            onClick={() => go(index)}
            aria-label={`Show slide ${index + 1}: ${item.name}`}
            aria-current={index === active}
            className={`size-3 rounded-full transition-colors duration-300 ${
              index === active ? "bg-brand" : "bg-[#e0d5d6] hover:bg-[#cdbcbe]"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
