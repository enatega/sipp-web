"use client";

import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";

interface Props {
  icon: ReactNode;
  title: string;
  subtitle?: string;
  badge?: string;
  onClick: () => void;
  disabled?: boolean;
  isHighlighted?: boolean;
  isCapitalized?: boolean;
}

/** One tappable row in the location lists (current, saved, popular, results). */
export function LocationRow({
  icon,
  title,
  subtitle,
  badge,
  onClick,
  disabled,
  isHighlighted,
  isCapitalized,
}: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex min-h-14.5 w-full items-center gap-3 border-b border-line py-3.5 text-start outline-none transition-colors hover:bg-soft-surface/60 focus-visible:ring-2 focus-visible:ring-brand disabled:opacity-60"
    >
      <span
        className={`flex-none ${isHighlighted ? "text-brand" : "text-body"}`}
      >
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <strong className={`truncate text-sm font-medium text-ink ${isCapitalized ? "capitalize" : ""}`}>
            {title}
          </strong>
          {badge ? (
            <small className="flex-none rounded-full bg-brand-soft px-2 py-0.5 text-[10px] font-semibold text-brand">
              {badge}
            </small>
          ) : null}
        </span>
        {subtitle ? (
          <small className="mt-1 block truncate text-xs leading-snug text-muted">
            {subtitle}
          </small>
        ) : null}
      </span>
      <ChevronRight aria-hidden="true" className="size-4.5 flex-none text-muted rtl:rotate-180" />
    </button>
  );
}
