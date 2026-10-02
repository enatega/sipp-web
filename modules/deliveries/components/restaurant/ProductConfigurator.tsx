"use client";

import { FormEvent, KeyboardEvent, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Check, ChevronRight, LoaderCircle, Minus, Plus, ShoppingCart, X } from "lucide-react";
import { useFormatter, useLocale, useTranslations } from "next-intl";
import { useAppCurrencyFormatter } from "@/lib/useAppCurrency";
import { ApiError } from "@/services/api/client";
import { cn } from "@/lib/utils";
import { useActionToast } from "@/components/shared/useActionToast";
import { DeliveryNotice } from "../feedback/DeliveryNotice";
import { DeliveryImage } from "../discovery/DeliveryImage";
import { CustomizationGroup } from "./CustomizationGroup";
import { CustomizationGroupBadge } from "./CustomizationGroupBadge";
import { CustomizationOptionRow } from "./CustomizationOptionRow";
import { useCartMutations, useCartQuery, useProductConfiguration } from "../../hooks/useRestaurantQueries";
import {
  buildVariationChoices,
  cartSelections,
  missingCustomizationGroups,
} from "../../utils/productCustomization";
import styles from "./restaurant-transitions.module.css";
import { getLocalizedProductName } from "../../utils/productTranslation";
import { applyProductDeal } from "../../utils/dealPricing";

interface Props {
  isStoreAvailable: boolean;
  isAuthenticated: boolean;
  onClose: () => void;
  onRequireSignIn: () => void;
  productId: string;
  storeName: string;
}

export function ProductConfigurator({ isStoreAvailable, isAuthenticated, onClose, onRequireSignIn, productId, storeName }: Props) {
  const t = useTranslations("deliveries.restaurant");
  const format = useFormatter();
  const formatAppCurrency = useAppCurrencyFormatter();
  const locale = useLocale();
  const { info, customizations } = useProductConfiguration(productId);
  const cart = useCartQuery(isAuthenticated);
  const { addItem, clear } = useCartMutations();
  const notify = useActionToast();
  const panelRef = useRef<HTMLDivElement>(null);
  const noticeRegionRef = useRef<HTMLDivElement>(null);
  const groupRefs = useRef(new Map<string, HTMLFieldSetElement>());
  const [quantity, setQuantity] = useState(1);
  const [selectedVariationKey, setSelectedVariationKey] = useState<string | null>(null);
  const [selectedByGroup, setSelectedByGroup] = useState<Record<string, string[]>>({});
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isConflictOpen, setIsConflictOpen] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isClosing, setIsClosing] = useState(false);

  const variationChoices = useMemo(
    () => buildVariationChoices(customizations.data?.variations ?? []),
    [customizations.data?.variations],
  );
  const firstVariation = variationChoices[0];
  const effectiveVariationKey =
    selectedVariationKey ??
    (firstVariation
      ? `${firstVariation.groupId}:${firstVariation.optionId}`
      : null);
  const selectedVariation =
    variationChoices.find(
      (choice) => `${choice.groupId}:${choice.optionId}` === effectiveVariationKey,
    ) ?? null;

  useEffect(() => {
    panelRef.current?.focus();
  }, [productId]);

  const product = info.data;
  const productName = product ? getLocalizedProductName(product, locale) : "";
  const customizationData = customizations.data ?? { variations: [], addons: [] };
  const missingGroups = missingCustomizationGroups(
    customizationData,
    selectedVariation,
    selectedByGroup,
  );
  const deal = product?.deal ?? null;
  const originalBasePrice = selectedVariation?.price ?? product?.price ?? 0;
  const basePrice = applyProductDeal(originalBasePrice, deal);
  const addonTotal = customizationData.addons.reduce(
    (total, section) =>
      total +
      section.options.reduce(
        (sum, option) =>
          selectedByGroup[section.groupId]?.includes(option.optionId)
            ? sum + option.price
            : sum,
        0,
      ),
    0,
  );
  const originalTotal = (originalBasePrice + addonTotal) * quantity;
  const total = applyProductDeal(originalBasePrice + addonTotal, deal) * quantity;
  const dealSavings = Number((originalTotal - total).toFixed(2));
  const dealLabel = deal
    ? deal.name ??
      (deal.discountType === "percentage"
        ? t("dealOffPercent", { value: deal.discountValue })
        : t("dealOffFixed", { amount: formatAppCurrency(format, deal.discountValue) }))
    : null;
  const variationPrice = (price: number) => (
    <PriceWithOriginal
      discounted={applyProductDeal(price, deal)}
      format={format}
      formatAppCurrency={formatAppCurrency}
      original={price}
      originalLabel={(value) => t("originalPrice", { price: value })}
    />
  );
  const cartQuantity =
    cart.data?.items.reduce(
      (totalQuantity, item) =>
        item.productId === productId
          ? totalQuantity + item.quantity
          : totalQuantity,
      0,
    ) ?? 0;
  const isConfigurationLoading = info.isPending || customizations.isPending;
  const isMutationPending = addItem.isPending || clear.isPending;
  const isInteractionLocked =
    !isStoreAvailable || isConfigurationLoading || (isAuthenticated && cart.isPending) || isMutationPending || !product || !product.inStock;

  function cartErrorMessage(error: unknown) {
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      return t("cartOfflineError");
    }
    if (error instanceof ApiError) {
      if (/store is currently closed/i.test(error.message)) return t("closedMessage");
      if (error.status === 401) return t("cartSignInError");
      if (error.status === 409) return t("cartConflictError");
      if (error.status === 408) return t("cartTimeoutError");
      if (error.status === 429) return t("cartRateLimitError");
      if (error.status >= 500) return t("cartUnavailableError");
    }
    return t("cartError");
  }

  function showSubmitError(error: unknown) {
    setSubmitError(cartErrorMessage(error));
    requestAnimationFrame(() => noticeRegionRef.current?.focus());
  }

  function requestClose() {
    if (!isClosing) setIsClosing(true);
  }

  function handlePanelKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") requestClose();
    if (event.key !== "Tab") return;
    const focusable = panelRef.current?.querySelectorAll<HTMLElement>(
      'button:not([disabled]), input:not([disabled]), [tabindex="0"]',
    );
    if (!focusable?.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function toggleOption(groupId: string, optionId: string) {
    const section = customizationData.addons.find((item) => item.groupId === groupId);
    if (!section) return;
    setSelectedByGroup((current) => {
      const selected = current[groupId] ?? [];
      let next: string[];
      if (section.selectionType === "single") {
        next = [optionId];
      } else if (selected.includes(optionId)) {
        next = selected.filter((id) => id !== optionId);
      } else if (section.maxSelect && selected.length >= section.maxSelect) {
        next = selected;
      } else {
        next = [...selected, optionId];
      }
      return { ...current, [groupId]: next };
    });
  }

  async function addConfiguredProduct() {
    if (!product || !product.inStock) return;
    if (!isStoreAvailable) throw new ApiError("Store is currently closed", 400);
    const updatedCart = await addItem.mutateAsync({
      productId: product.productId,
      quantity,
      selectedOptions: cartSelections(selectedVariation, selectedByGroup),
    });
    const updatedQuantity = updatedCart.items.reduce(
      (total, item) => item.productId === product.productId ? total + item.quantity : total,
      0,
    );
    // A 2xx response may report a skipped/unavailable item instead of adding it.
    if (updatedQuantity < cartQuantity + quantity) {
      throw new ApiError("Cart item was not added.", 422);
    }
    setSubmitError(null);
    notify.success("addedToCart", { product: productName });
    requestClose();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isAuthenticated) {
      onRequireSignIn();
      return;
    }
    if (!isStoreAvailable) {
      setSubmitError(t("closedMessage"));
      return;
    }
    setHasSubmitted(true);
    setSubmitError(null);
    if (missingGroups.length) {
      requestAnimationFrame(() => {
        groupRefs.current.get(missingGroups[0])?.focus();
        groupRefs.current.get(missingGroups[0])?.scrollIntoView({ behavior: "smooth", block: "center" });
      });
      return;
    }
    if (cart.data?.storeId && cart.data.storeId !== product?.storeId) {
      setIsConflictOpen(true);
      return;
    }
    try {
      await addConfiguredProduct();
    } catch (error) {
      showSubmitError(error);
    }
  }

  async function replaceCart() {
    try {
      await clear.mutateAsync();
      setIsConflictOpen(false);
      await addConfiguredProduct();
    } catch (error) {
      showSubmitError(error);
    }
  }

  const productHeader = (
    <div>
      <div className="relative">
        <DeliveryImage alt={productName} className={cn("aspect-[16/10] w-full rounded-none bg-[var(--soft-surface)]", product && !product.inStock && "opacity-60 grayscale")} sizes="470px" src={product?.imageUrl} />
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-surface to-transparent" />
        {product && !product.inStock ? (
          <span className="absolute start-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-danger-soft px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-danger shadow-sm">
            <span aria-hidden="true" className="size-1.5 rounded-full bg-danger" />
            {t("outOfStock")}
          </span>
        ) : null}
      </div>
      <div className="relative -mt-6 px-5 pb-1">
        <p className="truncate text-[11px] font-bold uppercase tracking-[0.16em] text-brand">{storeName}</p>
        {info.isPending ? <div className="mt-2 h-6 w-48 animate-pulse rounded bg-[var(--soft-surface)]" /> : null}
        <h2 className="mt-1 text-xl font-bold leading-tight text-ink sm:text-2xl">{productName}</h2>
        {product?.description ? <p className="mt-2 line-clamp-3 text-sm leading-6 text-body">{product.description}</p> : null}
        {product ? (
          <div className="mt-3 flex flex-wrap items-center gap-x-2.5 gap-y-2">
            <b className="text-xl tabular-nums text-brand">{formatAppCurrency(format, basePrice)}</b>
            {basePrice < originalBasePrice ? (
              <>
                <s aria-label={t("originalPrice", { price: formatAppCurrency(format, originalBasePrice) })} className="text-sm text-muted">
                  {formatAppCurrency(format, originalBasePrice)}
                </s>
                {dealLabel ? <span className="rounded-full bg-success-soft px-2.5 py-1 text-[11px] font-bold text-success">{dealLabel}</span> : null}
              </>
            ) : null}
            {cartQuantity > 0 ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-brand/10 px-2.5 py-1 text-[11px] font-bold text-brand" role="status">
                <Check aria-hidden="true" className="size-3.5" />
                {t("alreadyInCart", { count: cartQuantity })}
              </span>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 bg-black/45 backdrop-blur-[2px]",
        isClosing ? styles.backdropExit : styles.backdropEnter,
      )}
      onMouseDown={(event) => event.target === event.currentTarget && requestClose()}
    >
      <div
        aria-label={t("customizeProduct")}
        aria-modal="true"
        className={cn(
          "relative ml-auto flex h-full w-[min(100%,470px)] flex-col border-l border-line bg-surface shadow-pop outline-none",
          isClosing ? styles.sheetExit : styles.sheetEnter,
        )}
        onAnimationEnd={(event) => {
          if (isClosing && event.currentTarget === event.target) onClose();
        }}
        onKeyDown={handlePanelKeyDown}
        ref={panelRef}
        role="dialog"
        tabIndex={-1}
      >
        <button aria-label={t("closeCustomizer")} className="absolute end-4 top-4 z-10 grid size-10 place-items-center rounded-full bg-black/35 text-white shadow-sm backdrop-blur-md transition-colors duration-200 hover:bg-black/55" onClick={requestClose} type="button">
          <X aria-hidden="true" className="size-5" />
        </button>

        {info.isError || customizations.isError ? (
          <div className="min-h-0 flex-1 overflow-y-auto">
            {productHeader}
            <div className="m-5 rounded-xl border border-brand/30 bg-brand/5 p-4 text-sm text-brand" role="alert">
              {t("productLoadError")}
            </div>
          </div>
        ) : (
          <form className="flex min-h-0 flex-1 flex-col" onSubmit={handleSubmit}>
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
              {productHeader}
              <div className="space-y-3.5 px-5 pb-6 pt-5">
                {isConfigurationLoading ? (
                  <div className="space-y-3.5" aria-hidden="true">
                    {[0, 1].map((key) => (
                      <div key={key} className="animate-pulse rounded-2xl border border-line p-4">
                        <span className="block h-4 w-32 rounded bg-[var(--soft-surface)]" />
                        <span className="mt-4 block h-11 rounded-xl bg-[var(--soft-surface)]" />
                        <span className="mt-2 block h-11 rounded-xl bg-[var(--soft-surface)]" />
                      </div>
                    ))}
                  </div>
                ) : null}
                {variationChoices.length ? (
                  <fieldset
                    aria-invalid={hasSubmitted && missingGroups.includes("__variation__")}
                    className="rounded-2xl border border-line bg-card p-4"
                    ref={(element) => {
                      if (element) groupRefs.current.set("__variation__", element);
                    }}
                    tabIndex={-1}
                  >
                    <legend className="sr-only">{t("chooseVariation")}</legend>
                    <div aria-hidden="true" className="mb-3 flex items-center justify-between gap-3">
                      <span className="text-[15px] font-bold text-ink">{t("chooseVariation")}</span>
                      <CustomizationGroupBadge isComplete={Boolean(selectedVariation)} isRequired />
                    </div>
                    <div className="space-y-2">
                      {variationChoices.map((choice) => {
                        const key = `${choice.groupId}:${choice.optionId}`;
                        return (
                          <CustomizationOptionRow
                            checked={effectiveVariationKey === key}
                            disabled={isInteractionLocked}
                            key={key}
                            name="variation"
                            onChange={() => setSelectedVariationKey(key)}
                            price={variationPrice(choice.price)}
                            title={choice.title}
                            type="radio"
                          />
                        );
                      })}
                    </div>
                  </fieldset>
                ) : null}

                {customizationData.addons.map((section) => (
                  <CustomizationGroup
                    disabled={isInteractionLocked}
                    hasError={hasSubmitted && missingGroups.includes(section.groupId)}
                    key={section.groupId}
                    onToggle={toggleOption}
                    section={section}
                    selectedOptionIds={selectedByGroup[section.groupId] ?? []}
                    setRef={(element) => {
                      if (element) groupRefs.current.set(section.groupId, element);
                      else groupRefs.current.delete(section.groupId);
                    }}
                  />
                ))}
              </div>
            </div>

            <div className="shrink-0 border-t border-line bg-surface px-5 pb-5 pt-4 shadow-[0_-12px_30px_rgba(20,10,14,0.06)]">
              {submitError ? (
                <div className={cn("mb-3", styles.noticeEnter)} ref={noticeRegionRef} tabIndex={-1}>
                  <DeliveryNotice
                    dismissLabel={t("dismissMessage")}
                    message={submitError}
                    onDismiss={() => setSubmitError(null)}
                    tone="error"
                  />
                </div>
              ) : null}
              {cart.data && !cart.data.isEmpty ? (
                <Link
                  className="mb-4 flex min-h-12 w-full items-center gap-3 rounded-xl border border-brand/15 bg-brand/8 px-3 text-brand transition-colors duration-200 hover:bg-brand/12 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
                  href="/cart"
                >
                  <span className="relative grid size-8 shrink-0 place-items-center rounded-full bg-brand text-ink">
                    <ShoppingCart aria-hidden="true" className="size-4" />
                    <span className="absolute -end-1.5 -top-1.5 grid min-h-4 min-w-4 place-items-center rounded-full border-2 border-surface bg-ink px-1 text-[9px] font-extrabold leading-none text-surface tabular-nums">
                      {cart.data.totalItems > 99 ? "99+" : cart.data.totalItems}
                    </span>
                  </span>
                  <span className="min-w-0 flex-1 text-start">
                    <span className="block text-sm font-bold">{t("viewCart")}</span>
                    <span className="block text-[11px] text-body">
                      {t("itemCount", { count: cart.data.totalItems })}
                    </span>
                  </span>
                  <b className="shrink-0 text-sm tabular-nums">
                    {formatAppCurrency(format, cart.data.finalPrice)}
                  </b>
                  <ChevronRight aria-hidden="true" className="size-4 shrink-0 rtl:rotate-180" />
                </Link>
              ) : null}
              {product && !product.inStock ? (
                <p className="mb-3 rounded-xl bg-danger-soft px-4 py-3 text-xs font-medium leading-5 text-danger" role="status">
                  {t("outOfStockNotice")}
                </p>
              ) : null}
              <div className="flex items-stretch gap-3">
                <div aria-label={t("quantityLabel")} className="inline-flex h-13 shrink-0 items-center rounded-xl border border-line bg-card p-1" role="group">
                  <button aria-label={t("decreaseQuantity")} className="grid size-10 place-items-center rounded-lg text-ink transition-colors hover:bg-brand/10 hover:text-brand disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-ink" disabled={isInteractionLocked || quantity <= 1} onClick={() => setQuantity((value) => Math.max(1, value - 1))} type="button"><Minus aria-hidden="true" className="size-4" /></button>
                  <b aria-live="polite" className="min-w-8 text-center text-base tabular-nums text-ink">{quantity}</b>
                  <button aria-label={t("increaseQuantity")} className="grid size-10 place-items-center rounded-lg bg-brand text-ink transition-colors hover:bg-brand/85 disabled:cursor-not-allowed disabled:opacity-40" disabled={isInteractionLocked || quantity >= 99} onClick={() => setQuantity((value) => Math.min(99, value + 1))} type="button"><Plus aria-hidden="true" className="size-4" /></button>
                </div>
                {isStoreAvailable ? (
                  <button className="flex h-13 min-w-0 flex-1 items-center justify-between gap-3 rounded-xl bg-brand px-4 text-sm font-bold text-ink shadow-[0_10px_24px_rgba(102,192,242,0.25)] transition hover:bg-brand/85 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none" disabled={isInteractionLocked} type="submit">
                    <span className="flex min-w-0 items-center gap-2 truncate">
                      {isConfigurationLoading || (isAuthenticated && cart.isPending) || isMutationPending ? <LoaderCircle aria-hidden="true" className="size-4 shrink-0 animate-spin" /> : null}
                      <span className="truncate">
                        {isConfigurationLoading || (isAuthenticated && cart.isPending)
                          ? isConfigurationLoading
                            ? t("loadingProduct")
                            : t("preparingCart")
                          : isMutationPending
                            ? t("addingToCart")
                            : product && !product.inStock
                              ? t("outOfStock")
                              : t("addToCartShort")}
                      </span>
                    </span>
                    {!isConfigurationLoading && product ? (
                      <span className="flex shrink-0 flex-col items-end leading-tight">
                        {dealSavings > 0 ? (
                          <s aria-label={t("originalPrice", { price: formatAppCurrency(format, originalTotal) })} className="text-[10px] font-medium opacity-60">
                            {formatAppCurrency(format, originalTotal)}
                          </s>
                        ) : null}
                        <span className="tabular-nums" aria-label={t("total")}>{formatAppCurrency(format, total)}</span>
                      </span>
                    ) : null}
                  </button>
                ) : (
                  <div className="flex h-13 min-w-0 flex-1 items-center justify-between rounded-xl bg-[var(--soft-surface)] px-4">
                    <small className="text-xs text-muted">{t("total")}</small>
                    <b className="text-lg tabular-nums text-brand">{formatAppCurrency(format, total)}</b>
                  </div>
                )}
              </div>
              {!isConfigurationLoading && dealSavings > 0 && dealLabel ? (
                <p className="mt-2.5 text-center text-xs font-medium text-success" role="status">
                  {t("dealSavings", { deal: dealLabel, amount: formatAppCurrency(format, dealSavings) })}
                </p>
              ) : null}
            </div>
          </form>
        )}
      </div>

      {isConflictOpen ? (
        <div aria-modal="true" className="fixed inset-0 z-[60] grid place-items-center bg-black/55 p-5" role="alertdialog">
          <div className={cn("w-full max-w-sm rounded-2xl bg-surface p-6 shadow-pop", styles.dialogEnter)}>
            <h3 className="text-lg font-bold text-ink">{t("cartConflictTitle")}</h3>
            <p className="mt-2 text-sm leading-6 text-body">{t("cartConflictMessage", { store: storeName })}</p>
            <div className="mt-5 flex gap-3">
              <button className="h-11 flex-1 rounded-xl border border-line text-sm font-bold text-ink" disabled={isMutationPending} onClick={() => setIsConflictOpen(false)} type="button">{t("keepCart")}</button>
              <button className="h-11 flex-1 rounded-xl bg-brand text-sm font-bold text-ink" disabled={isMutationPending} onClick={() => void replaceCart()} type="button">{t("replaceCart")}</button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

interface PriceWithOriginalProps {
  discounted: number;
  format: ReturnType<typeof useFormatter>;
  formatAppCurrency: ReturnType<typeof useAppCurrencyFormatter>;
  original: number;
  originalLabel: (price: string) => string;
}

function PriceWithOriginal({ discounted, format, formatAppCurrency, original, originalLabel }: PriceWithOriginalProps) {
  if (discounted >= original) {
    return <span className="text-muted">{formatAppCurrency(format, original)}</span>;
  }
  return (
    <span className="flex items-baseline gap-1.5">
      <s aria-label={originalLabel(formatAppCurrency(format, original))} className="text-[11px] text-muted">
        {formatAppCurrency(format, original)}
      </s>
      <b className="text-brand">{formatAppCurrency(format, discounted)}</b>
    </span>
  );
}
