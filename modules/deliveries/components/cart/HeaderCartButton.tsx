"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { formatAppCurrency } from "@/config/currency";

interface Props {
  itemCount: number;
  total: number;
}

/**
 * Header summary for a filled cart: count, cart and total in one brand pill.
 * Collapses to icon + total on small screens and drops the total on the
 * narrowest phones so the header never wraps.
 */
export function HeaderCartButton({ itemCount, total }: Props) {
  const t = useTranslations("deliveries.cart");
  const format = useFormatter();
  const formattedTotal = formatAppCurrency(format, total);
  const countLabel = itemCount > 99 ? "99+" : String(itemCount);

  return (
    <Link
      href="/cart"
      aria-label={t("headerCartAria", { count: itemCount, total: formattedTotal })}
      className="group inline-flex h-8 flex-none items-center gap-1.5 rounded-full bg-brand ps-1.5 pe-3 text-ink shadow-[0_6px_16px_color-mix(in_srgb,var(--color-brand)_28%,transparent)] outline-none transition-[background-color,transform] hover:bg-brand/85 focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface active:scale-[0.98] max-[380px]:pe-1.5 sm:h-10 sm:gap-2 sm:ps-1.5 sm:pe-4"
    >
      {/* Mobile: icon with an overlapping count badge. */}
      <span aria-hidden="true" className="relative grid size-6 place-items-center sm:hidden">
        <ShoppingCart className="size-4" />
        <span className="absolute -end-1.5 -top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-card px-1 text-[9px] font-bold leading-none text-ink tabular-nums ring-2 ring-brand">
          {countLabel}
        </span>
      </span>

      {/* sm and up: count chip followed by the icon. */}
      <span
        aria-hidden="true"
        className="hidden size-7 place-items-center rounded-full bg-card text-xs font-bold text-ink tabular-nums sm:grid"
      >
        {countLabel}
      </span>
      <ShoppingCart aria-hidden="true" className="hidden size-4 sm:block" />
      <span aria-hidden="true" className="hidden whitespace-nowrap text-sm font-semibold lg:inline">
        {t("headerCartLabel")}
      </span>

      <span aria-hidden="true" className="hidden h-4 w-px bg-ink/25 sm:block" />
      <span
        aria-hidden="true"
        className="whitespace-nowrap text-xs font-bold tabular-nums max-[380px]:hidden sm:text-sm"
      >
        {formattedTotal}
      </span>
    </Link>
  );
}
