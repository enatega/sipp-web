"use client";

import { Check, RotateCcw, SlidersHorizontal, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { KeyboardEvent, useEffect, useRef, useState } from "react";
import type {
  DeliveryShopType,
  DiscoveryPriceTier,
  DiscoverySort,
  DiscoveryStock,
} from "@/modules/deliveries/types/discovery";
import { decodeDisplayText } from "@/modules/deliveries/utils/discoveryMappers";
import { useAppCurrency } from "@/lib/useAppCurrency";
import styles from "./discovery-filter-drawer.module.css";

export interface DiscoveryFilterValues {
  stock: DiscoveryStock;
  priceTiers: DiscoveryPriceTier[];
  sortBy: DiscoverySort;
  shopTypeId: string;
}

interface Props {
  value: DiscoveryFilterValues;
  shopTypes: DeliveryShopType[];
  showShopTypes: boolean;
  onApply: (value: DiscoveryFilterValues) => void;
  onClose: () => void;
}

const STOCKS: DiscoveryStock[] = ["all", "instock", "outofstock"];
const TIERS: DiscoveryPriceTier[] = ["$", "$$", "$$$", "$$$$"];
const SORTS: DiscoverySort[] = [
  "recommended",
  "rating",
  "delivery_time",
  "delivery_price",
  "name",
];

function selectionCount(value: DiscoveryFilterValues) {
  return (
    (value.stock !== "all" ? 1 : 0) +
    value.priceTiers.length +
    (value.shopTypeId ? 1 : 0) +
    (value.sortBy !== "recommended" ? 1 : 0)
  );
}

export function DiscoveryFilterDrawer({
  value,
  shopTypes,
  showShopTypes,
  onApply,
  onClose,
}: Props) {
  const t = useTranslations("deliveries.seeAll");
  const { symbol: currencySymbol } = useAppCurrency();
  const panelRef = useRef<HTMLDivElement>(null);
  const [draft, setDraft] = useState(value);
  const [closing, setClosing] = useState(false);
  const draftCount = selectionCount(draft);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  function finishClose(afterClose?: () => void) {
    if (closing) return;
    setClosing(true);
    window.setTimeout(() => {
      afterClose?.();
      onClose();
    }, 220);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      finishClose();
      return;
    }
    if (event.key !== "Tab") return;
    const controls = panelRef.current?.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href], [tabindex="0"]',
    );
    if (!controls?.length) return;
    const first = controls[0];
    const last = controls[controls.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function clearDraft() {
    setDraft({
      stock: "all",
      priceTiers: [],
      sortBy: "recommended",
      shopTypeId: "",
    });
  }

  return (
    <div
      className={`fixed inset-0 z-[80] flex justify-end bg-black/50 backdrop-blur-[2px] ${closing ? styles.backdropOut : styles.backdropIn}`}
      onMouseDown={(event) => {
        if (event.currentTarget === event.target) finishClose();
      }}
    >
      <div
        aria-labelledby="discovery-filter-title"
        aria-modal="true"
        className={`flex h-full w-full max-w-[460px] flex-col bg-card shadow-[-14px_0_50px_rgba(20,10,14,0.18)] ${closing ? styles.drawerOut : styles.drawerIn}`}
        onKeyDown={handleKeyDown}
        ref={panelRef}
        role="dialog"
        tabIndex={-1}
      >
        <header className="flex items-start justify-between gap-5 border-b border-line px-5 py-5 sm:px-7 sm:py-6">
          <div>
            <span className="mb-4 grid size-10 place-items-center rounded-xl bg-danger-soft text-brand">
              <SlidersHorizontal aria-hidden="true" className="size-5" />
            </span>
            <h2 className="font-heading text-xl font-extrabold tracking-[-0.025em] text-ink" id="discovery-filter-title">
              {t("filterTitle")}
            </h2>
            <p className="mt-1 max-w-sm text-xs leading-5 text-body">
              {t("filterDescription")}
            </p>
          </div>
          <button
            aria-label={t("closeFilters")}
            autoFocus
            className="grid size-10 shrink-0 place-items-center rounded-full bg-[var(--soft-surface)] text-muted transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            onClick={() => finishClose()}
            type="button"
          >
            <X aria-hidden="true" className="size-5" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-6 sm:px-7">
          <FilterGroup label={t("availability")}>
            {STOCKS.map((option) => (
              <Choice
                key={option}
                label={t(`stock.${option}`)}
                selected={draft.stock === option}
                onClick={() => setDraft((current) => ({ ...current, stock: option }))}
              />
            ))}
          </FilterGroup>

          <FilterGroup label={t("price")}>
            {TIERS.map((tier) => (
              <Choice
                key={tier}
                label={currencySymbol.repeat(tier.length)}
                selected={draft.priceTiers.includes(tier)}
                onClick={() => setDraft((current) => ({
                  ...current,
                  priceTiers: current.priceTiers.includes(tier)
                    ? current.priceTiers.filter((item) => item !== tier)
                    : [...current.priceTiers, tier],
                }))}
              />
            ))}
          </FilterGroup>

          {showShopTypes ? (
            <FilterGroup label={t("shopType")}>
              {shopTypes.map((shopType) => (
                <Choice
                  key={shopType.id}
                  label={decodeDisplayText(shopType.name)}
                  selected={draft.shopTypeId === shopType.id}
                  onClick={() => setDraft((current) => ({
                    ...current,
                    shopTypeId: current.shopTypeId === shopType.id ? "" : shopType.id,
                  }))}
                />
              ))}
            </FilterGroup>
          ) : null}

          <FilterGroup label={t("sort")} stacked>
            {SORTS.map((option) => (
              <Choice
                key={option}
                label={t(`sorts.${option}`)}
                selected={draft.sortBy === option}
                onClick={() => setDraft((current) => ({ ...current, sortBy: option }))}
                wide
              />
            ))}
          </FilterGroup>
        </div>

        <footer className="border-t border-line bg-card px-5 py-4 sm:px-7 sm:py-5">
          <div className="flex items-center gap-3">
            <button
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-4 text-sm font-bold text-body transition-colors hover:bg-[var(--soft-surface)] disabled:cursor-not-allowed disabled:opacity-40"
              disabled={draftCount === 0}
              onClick={clearDraft}
              type="button"
            >
              <RotateCcw aria-hidden="true" className="size-4" />
              {t("clearAll")}
            </button>
            <button
              className="min-h-12 flex-1 rounded-xl bg-brand px-6 text-sm font-bold text-ink shadow-[0_8px_22px_rgba(102,192,242,0.2)] transition-colors hover:bg-brand/85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              onClick={() => finishClose(() => onApply(draft))}
              type="button"
            >
              {t("applyFilters", { count: draftCount })}
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}

function FilterGroup({ label, children, stacked = false }: { label: string; children: React.ReactNode; stacked?: boolean }) {
  return (
    <div
      aria-label={label}
      className="border-b border-line py-6 first:pt-0 last:border-0 last:pb-0"
      role="group"
    >
      <h3 className="mb-3 text-sm font-bold text-ink">{label}</h3>
      <div className={stacked ? "grid gap-2" : "flex flex-wrap gap-2"}>{children}</div>
    </div>
  );
}

function Choice({ label, selected, onClick, wide = false }: { label: string; selected: boolean; onClick: () => void; wide?: boolean }) {
  return (
    <button
      aria-pressed={selected}
      className={`${wide ? "flex w-full items-center justify-between" : "inline-flex items-center"} min-h-11 gap-2 rounded-xl border px-3.5 text-left text-xs font-bold transition-[border-color,background-color,color,transform] duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${selected ? "border-brand/30 bg-danger-soft text-brand" : "border-line bg-card text-body hover:border-brand/25 hover:text-ink active:scale-[0.98]"}`}
      onClick={onClick}
      type="button"
    >
      {label}
      {selected ? <Check aria-hidden="true" className="size-4" /> : null}
    </button>
  );
}
