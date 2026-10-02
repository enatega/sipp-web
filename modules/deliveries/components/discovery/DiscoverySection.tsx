"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  MapPin,
  RefreshCw,
} from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { StoreCardSkeleton } from "./skeletons/StoreCardSkeleton";
import { TopBrandCardSkeleton } from "./skeletons/TopBrandCardSkeleton";

export function SectionHeading({
  title,
  description,
  actionHref,
  actionLabel,
  isActionPending = false,
}: {
  title: string;
  description?: string;
  actionHref?: string;
  actionLabel?: string;
  /** Reserves the action's space while loading so the heading never reflows. */
  isActionPending?: boolean;
}) {
  return (
    <div className="flex items-end justify-between gap-3 sm:gap-4">
      <div className="min-w-0 max-w-2xl">
        <h2 className="font-heading text-xl font-extrabold tracking-[-0.03em] text-ink sm:text-[1.7rem]">
          {title}
        </h2>
        {description ? (
          <p className="mt-1 max-w-xl text-xs leading-[1.45] text-muted sm:text-sm sm:leading-5">
            {description}
          </p>
        ) : null}
      </div>
      {actionHref && actionLabel ? (
        <Link
          className="group/see-all inline-flex shrink-0 items-center gap-0.5 rounded-full px-2 py-1.5 text-xs font-bold text-brand sm:gap-1 sm:px-3 sm:py-2 transition-colors hover:bg-brand-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand sm:text-sm"
          href={actionHref}
        >
          {actionLabel}
          <ChevronRight
            aria-hidden="true"
            className="size-4 transition-[translate] duration-200 group-hover/see-all:translate-x-0.5 rtl:-scale-x-100"
          />
        </Link>
      ) : isActionPending && actionLabel ? (
        <span
          aria-hidden="true"
          className="invisible inline-flex shrink-0 items-center gap-0.5 px-2 py-1.5 text-xs font-bold sm:gap-1 sm:px-3 sm:py-2 sm:text-sm"
        >
          {actionLabel}
          <span className="size-4" />
        </span>
      ) : null}
    </div>
  );
}

export function Rail({ children }: { children: React.ReactNode }) {
  const t = useTranslations("deliveries.discovery");
  const railRef = useRef<HTMLDivElement>(null);
  const [canScrollBack, setCanScrollBack] = useState(false);
  const [canScrollForward, setCanScrollForward] = useState(false);

  const syncControls = useCallback(() => {
    const rail = railRef.current;
    if (!rail) return;
    setCanScrollBack(rail.scrollLeft > 4);
    setCanScrollForward(
      rail.scrollLeft + rail.clientWidth < rail.scrollWidth - 4,
    );
  }, []);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    syncControls();
    const observer = new ResizeObserver(syncControls);
    observer.observe(rail);
    return () => observer.disconnect();
  }, [children, syncControls]);

  function move(direction: -1 | 1) {
    const rail = railRef.current;
    if (!rail) return;
    rail.scrollBy({
      behavior: "smooth",
      left: direction * Math.max(240, rail.clientWidth * 0.78),
    });
  }

  return (
    <div className="group/rail relative">
      <div
        className="-mx-5 overflow-x-auto px-5 pb-6 pt-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:-mx-7 sm:px-7"
        onScroll={syncControls}
        ref={railRef}
      >
        <div className="flex w-max min-w-full snap-x snap-mandatory gap-3 pr-5 sm:gap-4 sm:pr-7">
          {children}
        </div>
      </div>

      <button
        aria-label={t("previousItems")}
        className={cn(
          "absolute left-0 top-1/2 z-10 hidden size-11 -translate-y-1/2 place-items-center rounded-full bg-card/95 text-ink shadow-pop transition duration-200 hover:scale-105 hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand sm:-left-2 sm:grid",
          canScrollBack ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={() => move(-1)}
        type="button"
      >
        <ChevronLeft aria-hidden="true" className="size-5" />
      </button>
      <button
        aria-label={t("nextItems")}
        className={cn(
          "absolute right-0 top-1/2 z-10 hidden size-11 -translate-y-1/2 place-items-center rounded-full bg-card/95 text-ink shadow-pop transition duration-200 hover:scale-105 hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand sm:-right-2 sm:grid",
          canScrollForward ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={() => move(1)}
        type="button"
      >
        <ChevronRight aria-hidden="true" className="size-5" />
      </button>
    </div>
  );
}

export function SectionState({
  title,
  message,
  tone = "empty",
  actionLabel,
  onAction,
}: {
  title: string;
  message: string;
  tone?: "empty" | "error" | "location";
  actionLabel?: string;
  onAction?: () => void;
}) {
  const Icon =
    tone === "error" ? AlertCircle : tone === "location" ? MapPin : RefreshCw;
  return (
    <div
      className={cn(
        "flex min-h-32 flex-col items-start gap-4 rounded-2xl bg-[var(--soft-surface)] px-5 py-6 sm:flex-row sm:items-center sm:px-7",
        tone === "error" && "bg-danger-soft",
      )}
      role={tone === "error" ? "alert" : "status"}
    >
      <span
        className={cn(
          "grid size-11 shrink-0 place-items-center rounded-xl bg-card text-brand shadow-rail-card",
          tone === "error" && "text-danger",
        )}
      >
        <Icon aria-hidden="true" className="size-5" />
      </span>
      <div className="min-w-0 flex-1">
        <h3 className="font-heading text-sm font-bold text-ink">{title}</h3>
        <p className="mt-1 max-w-xl text-xs leading-5 text-muted">{message}</p>
      </div>
      {actionLabel && onAction ? (
        <button
          className="shrink-0 rounded-full bg-brand px-4 py-2 text-xs font-semibold text-ink transition-colors hover:bg-brand/85 focus-visible:outline-2 focus-visible:outline-offset-2"
          onClick={onAction}
          type="button"
        >
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}

const RAIL_SKELETONS = {
  store: { Card: StoreCardSkeleton, count: 6 },
  brand: { Card: TopBrandCardSkeleton, count: 9 },
} as const;

/** A rail of card-shaped placeholders sized like the cards that replace them. */
export function RailSkeleton({ card = "store" }: { card?: keyof typeof RAIL_SKELETONS }) {
  const { Card, count } = RAIL_SKELETONS[card];
  return (
    <div aria-hidden="true" className="-mx-5 overflow-hidden px-5 pb-6 pt-3 sm:-mx-7 sm:px-7">
      <div className="flex w-max min-w-full gap-3 pr-5 sm:gap-4 sm:pr-7">
        {Array.from({ length: count }, (_, index) => (
          <Card key={index} />
        ))}
      </div>
    </div>
  );
}
