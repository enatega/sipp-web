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

export function SectionHeading({
  title,
  description,
  actionHref,
  actionLabel,
}: {
  title: string;
  description?: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div className="max-w-2xl">
        <h2 className="font-heading text-[1.35rem] font-extrabold tracking-[-0.03em] text-ink sm:text-[1.7rem]">
          {title}
        </h2>
        {description ? (
          <p className="mt-1 max-w-xl text-xs leading-5 text-muted sm:text-sm">
            {description}
          </p>
        ) : null}
      </div>
      {actionHref && actionLabel ? (
        <Link
          className="shrink-0 rounded-full px-3 py-2 text-xs font-bold text-brand transition-colors hover:bg-danger-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand sm:text-sm"
          href={actionHref}
        >
          {actionLabel}
        </Link>
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
          "absolute left-0 top-1/2 z-10 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-card/95 text-ink shadow-pop transition duration-200 hover:scale-105 hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand sm:-left-2",
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
          "absolute right-0 top-1/2 z-10 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-card/95 text-ink shadow-pop transition duration-200 hover:scale-105 hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand sm:-right-2",
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

export function RailSkeleton({ compact = false }: { compact?: boolean }) {
  return (
    <Rail>
      {Array.from({ length: compact ? 7 : 4 }, (_, index) => (
        <div
          aria-hidden="true"
          className={cn(
            "shrink-0 snap-start animate-pulse rounded-2xl bg-[var(--soft-surface)]",
            compact
              ? "h-[184px] w-40 sm:h-[196px] sm:w-44"
              : "h-[250px] w-[252px] sm:w-[282px]",
          )}
          key={index}
        />
      ))}
    </Rail>
  );
}
