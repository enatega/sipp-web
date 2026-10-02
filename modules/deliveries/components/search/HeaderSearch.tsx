"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useId, useRef, useState } from "react";
import type { FormEvent, KeyboardEvent } from "react";
import { ArrowRight, LoaderCircle, Search, X } from "lucide-react";
import { useFormatter, useLocale, useTranslations } from "next-intl";
import { formatAppCurrency } from "@/config/currency";
import { useSessionQuery } from "@/modules/account";
import { DeliveryImage } from "@/modules/deliveries/components/discovery/DeliveryImage";
import { useDiscoveryLocation } from "@/modules/deliveries/hooks/useDiscoveryQueries";
import { useProductSearchQuery } from "@/modules/deliveries/hooks/useSearchQueries";
import { getLocalizedProductName } from "@/modules/deliveries/utils/productTranslation";
import type { SearchProduct } from "@/modules/deliveries/types/search";

const MIN_SUGGESTION_LENGTH = 3;
const SUGGESTION_DEBOUNCE_MS = 300;

function productHref(product: SearchProduct) {
  return `/restaurants/${encodeURIComponent(product.storeId)}?productId=${encodeURIComponent(product.productId)}`;
}

function useDebouncedValue(value: string) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timeout = window.setTimeout(() => setDebounced(value), SUGGESTION_DEBOUNCE_MS);
    return () => window.clearTimeout(timeout);
  }, [value]);
  return debounced;
}

export function HeaderSearch() {
  // Search params need a Suspense boundary on statically rendered pages.
  return (
    <Suspense fallback={<HeaderSearchField initialQuery="" />}>
      <HeaderSearchWithQuery />
    </Suspense>
  );
}

/** On the search page the field shows the query being viewed. */
function HeaderSearchWithQuery() {
  const pathname = usePathname();
  const params = useSearchParams();
  const query = pathname?.startsWith("/search") ? params.get("q")?.trim() ?? "" : "";
  return <HeaderSearchField initialQuery={query} key={query} />;
}

function HeaderSearchField({ initialQuery }: { initialQuery: string }) {
  const t = useTranslations("deliveries.search");
  const router = useRouter();
  const listboxId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [input, setInput] = useState(initialQuery);
  const [isOpen, setIsOpen] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const session = useSessionQuery();
  const { location, isLocationReady } = useDiscoveryLocation(
    session.data?.authenticated === true,
  );
  const trimmed = input.trim();
  const debounced = useDebouncedValue(trimmed);
  const suggestionQuery = debounced.length >= MIN_SUGGESTION_LENGTH ? debounced : "";
  const products = useProductSearchQuery(suggestionQuery, location);
  const suggestions = products.data?.pages.flatMap((page) => page.items) ?? [];
  const isTyping = trimmed !== debounced;
  const showPanel = isOpen && trimmed.length >= MIN_SUGGESTION_LENGTH;

  useEffect(() => {
    const close = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
        setIsMobileOpen(false);
      }
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, []);

  useEffect(() => {
    const focusOnSlash = (event: globalThis.KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isEditing =
        target?.isContentEditable ||
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.tagName === "SELECT";
      if (event.key !== "/" || isEditing) return;
      event.preventDefault();
      setIsMobileOpen(true);
      inputRef.current?.focus();
    };
    window.addEventListener("keydown", focusOnSlash);
    return () => window.removeEventListener("keydown", focusOnSlash);
  }, []);

  useEffect(() => {
    if (isMobileOpen) inputRef.current?.focus();
  }, [isMobileOpen]);

  const reset = () => {
    setIsOpen(false);
    setIsMobileOpen(false);
    setActiveIndex(-1);
    inputRef.current?.blur();
  };

  const goToSearchPage = (value: string) => {
    const query = value.trim();
    if (!query) return;
    reset();
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  const openProduct = (product: SearchProduct) => {
    reset();
    router.push(productHref(product));
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const active = activeIndex >= 0 ? suggestions[activeIndex] : undefined;
    if (active) openProduct(active);
    else goToSearchPage(input);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      if (isOpen) setIsOpen(false);
      else reset();
      return;
    }
    if (!showPanel || suggestions.length === 0) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => (index + 1) % suggestions.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => (index <= 0 ? suggestions.length - 1 : index - 1));
    }
  };

  useEffect(() => {
    if (activeIndex < 0) return;
    document
      .getElementById(`${listboxId}-option-${activeIndex}`)
      ?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, listboxId]);

  return (
    <div ref={containerRef} className="flex-none md:ml-auto md:flex md:min-w-0 md:flex-1 md:justify-end">
      <button
        aria-expanded={isMobileOpen}
        aria-label={t("label")}
        className="grid size-10 place-items-center rounded-full text-ink transition hover:bg-[var(--soft-surface)] hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand md:hidden"
        onClick={() => setIsMobileOpen((open) => !open)}
        type="button"
      >
        {isMobileOpen ? <X aria-hidden="true" className="size-5" /> : <Search aria-hidden="true" className="size-5" />}
      </button>

      <div
        className={`${isMobileOpen ? "block" : "hidden"} absolute inset-x-0 top-full border-t border-line bg-surface px-4 py-3 shadow-pop md:relative md:block md:w-full md:max-w-[300px] lg:max-w-[340px] xl:max-w-[400px] md:border-0 md:bg-transparent md:p-0 md:shadow-none`}
      >
        <form className="relative" onSubmit={submit} role="search">
          <label className="sr-only" htmlFor={`${listboxId}-input`}>{t("label")}</label>
          <Search aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 size-[18px] -translate-y-1/2 text-muted" />
          <input
            ref={inputRef}
            aria-activedescendant={activeIndex >= 0 ? `${listboxId}-option-${activeIndex}` : undefined}
            aria-autocomplete="list"
            aria-controls={listboxId}
            aria-expanded={showPanel}
            autoComplete="off"
            className="h-11 w-full rounded-full border border-line bg-[var(--soft-surface)] pl-11 pr-20 text-sm text-ink outline-none transition placeholder:text-muted hover:border-brand/40 focus:border-brand focus:bg-card focus:ring-4 focus:ring-brand/15"
            enterKeyHint="search"
            id={`${listboxId}-input`}
            maxLength={80}
            onChange={(event) => {
              setInput(event.target.value);
              setIsOpen(true);
              setActiveIndex(-1);
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={onKeyDown}
            placeholder={t("headerPlaceholder")}
            inputMode="search"
            role="combobox"
            type="text"
            value={input}
          />
          <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1">
            {input ? (
              <button
                aria-label={t("clearSearch")}
                className="grid size-7 place-items-center rounded-full text-muted transition hover:bg-line/60 hover:text-ink"
                onClick={() => {
                  setInput("");
                  setActiveIndex(-1);
                  inputRef.current?.focus();
                }}
                type="button"
              >
                <X aria-hidden="true" className="size-4" />
              </button>
            ) : (
              <kbd className="hidden h-6 min-w-6 place-items-center rounded-md border border-line bg-card px-1.5 text-[11px] font-semibold text-muted lg:grid">/</kbd>
            )}
          </div>
        </form>

        {showPanel ? (
          <div className="absolute inset-x-4 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-line bg-card shadow-pop md:inset-x-auto md:right-0 md:w-[max(100%,400px)]">
            <p className="border-b border-line px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted" id={`${listboxId}-heading`}>
              {t("suggestionsHeading")}
            </p>
            {!isLocationReady || isTyping || (products.isPending && Boolean(location)) ? (
              <div aria-live="polite" className="flex items-center gap-2 px-4 py-5 text-sm text-muted" role="status">
                <LoaderCircle aria-hidden="true" className="size-4 animate-spin text-brand" />
                {t("suggestionsLoading")}
              </div>
            ) : !location ? (
              <p className="px-4 py-5 text-sm text-muted">{t("chooseLocation")}</p>
            ) : products.isError ? (
              <p className="px-4 py-5 text-sm text-muted">{t("error")}</p>
            ) : suggestions.length === 0 ? (
              <p className="px-4 py-5 text-sm text-muted">{t("noSuggestions", { query: trimmed })}</p>
            ) : (
              <ul
                aria-labelledby={`${listboxId}-heading`}
                className="max-h-[min(360px,60vh)] overflow-y-auto overscroll-contain py-1.5"
                id={listboxId}
                role="listbox"
              >
                {suggestions.map((product, index) => (
                  <SuggestionRow
                    active={index === activeIndex}
                    id={`${listboxId}-option-${index}`}
                    key={`${product.storeId}-${product.productId}`}
                    onHover={() => setActiveIndex(index)}
                    onSelect={() => openProduct(product)}
                    product={product}
                  />
                ))}
              </ul>
            )}
            <button
              className="flex w-full items-center justify-between gap-3 border-t border-line px-4 py-3 text-left text-sm font-semibold text-brand transition hover:bg-[var(--soft-surface)]"
              onClick={() => goToSearchPage(input)}
              type="button"
            >
              <span className="truncate">{t("seeAllResults", { query: trimmed })}</span>
              <ArrowRight aria-hidden="true" className="size-4 flex-none" />
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function SuggestionRow({
  active,
  id,
  onHover,
  onSelect,
  product,
}: {
  active: boolean;
  id: string;
  onHover: () => void;
  onSelect: () => void;
  product: SearchProduct;
}) {
  const locale = useLocale();
  const format = useFormatter();
  const name = getLocalizedProductName(
    { name: product.productName, nameTranslations: product.productNameTranslations },
    locale,
  );

  return (
    <li
      aria-selected={active}
      className={`mx-1.5 flex cursor-pointer items-center gap-3 rounded-xl px-2.5 py-2 transition-colors ${active ? "bg-[var(--soft-surface)]" : ""}`}
      id={id}
      onClick={onSelect}
      onMouseDown={(event) => event.preventDefault()}
      onMouseEnter={onHover}
      role="option"
    >
      <DeliveryImage
        alt=""
        className="size-12 flex-none overflow-hidden rounded-lg"
        sizes="48px"
        src={product.productImage ?? product.storeImage ?? product.storeLogo}
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-ink">{name}</p>
        <p className="mt-0.5 truncate text-xs text-muted">{product.storeName}</p>
      </div>
      <span className="flex-none text-sm font-bold tabular-nums text-brand">
        {formatAppCurrency(format, product.price)}
      </span>
    </li>
  );
}
