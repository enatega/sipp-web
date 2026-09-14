"use client";

import { FormEvent, KeyboardEvent, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Check, ChevronRight, LoaderCircle, Minus, Plus, ShoppingCart, X } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { ApiError } from "@/services/api/client";
import { cn } from "@/lib/utils";
import { DeliveryNotice } from "../feedback/DeliveryNotice";
import { DeliveryImage } from "../discovery/DeliveryImage";
import { CustomizationGroup } from "./CustomizationGroup";
import { useCartMutations, useCartQuery, useProductConfiguration } from "../../hooks/useRestaurantQueries";
import {
  buildVariationChoices,
  cartSelections,
  missingCustomizationGroups,
} from "../../utils/productCustomization";
import styles from "./restaurant-transitions.module.css";

interface Props {
  isAuthenticated: boolean;
  onClose: () => void;
  onRequireSignIn: () => void;
  productId: string;
  storeName: string;
}

export function ProductConfigurator({ isAuthenticated, onClose, onRequireSignIn, productId, storeName }: Props) {
  const t = useTranslations("deliveries.restaurant");
  const format = useFormatter();
  const { info, customizations } = useProductConfiguration(productId);
  const cart = useCartQuery(isAuthenticated);
  const { addItem, clear } = useCartMutations();
  const panelRef = useRef<HTMLDivElement>(null);
  const noticeRegionRef = useRef<HTMLDivElement>(null);
  const groupRefs = useRef(new Map<string, HTMLFieldSetElement>());
  const [quantity, setQuantity] = useState(1);
  const [selectedVariationKey, setSelectedVariationKey] = useState<string | null>(null);
  const [selectedByGroup, setSelectedByGroup] = useState<Record<string, string[]>>({});
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isConflictOpen, setIsConflictOpen] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
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
  const customizationData = customizations.data ?? { variations: [], addons: [] };
  const missingGroups = missingCustomizationGroups(
    customizationData,
    selectedVariation,
    selectedByGroup,
  );
  const basePrice = selectedVariation?.price ?? product?.deal?.discountedPrice ?? product?.price ?? 0;
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
  const total = (basePrice + addonTotal) * quantity;
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
    isConfigurationLoading || (isAuthenticated && cart.isPending) || isMutationPending || !product || !product.inStock;

  function cartErrorMessage(error: unknown) {
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      return t("cartOfflineError");
    }
    if (error instanceof ApiError) {
      if (error.status === 401) return t("cartSignInError");
      if (error.status === 409) return t("cartConflictError");
      if (error.status === 408) return t("cartTimeoutError");
      if (error.status === 429) return t("cartRateLimitError");
      if (error.status >= 500) return t("cartUnavailableError");
    }
    return t("cartError");
  }

  function showSubmitError(error: unknown) {
    setIsAdded(false);
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
    setIsAdded(false);
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
    if (!product) return;
    await addItem.mutateAsync({
      productId: product.productId,
      quantity,
      selectedOptions: cartSelections(selectedVariation, selectedByGroup),
    });
    setIsAdded(true);
    setSubmitError(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isAuthenticated) {
      onRequireSignIn();
      return;
    }
    setHasSubmitted(true);
    setIsAdded(false);
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
          "ml-auto flex h-full w-[min(100%,470px)] flex-col border-l border-line bg-surface shadow-pop outline-none",
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
        <div className="flex items-start gap-4 border-b border-line p-5">
          <DeliveryImage alt={product?.name ?? ""} className="size-24 shrink-0 rounded-xl" sizes="96px" src={product?.imageUrl} />
          <div className="min-w-0 flex-1 pt-1">
            {info.isPending ? <div className="h-5 w-40 animate-pulse rounded bg-[var(--soft-surface)]" /> : null}
            <h2 className="text-lg font-bold text-ink">{product?.name}</h2>
            <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted">{product?.description}</p>
            {product ? (
              <b className="mt-2 block text-lg text-brand">
                {format.number(product.deal?.discountedPrice ?? product.price, { style: "currency", currency: "INR" })}
              </b>
            ) : null}
            {cartQuantity > 0 ? (
              <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-brand/10 px-2.5 py-1 text-[11px] font-bold text-brand" role="status">
                <Check aria-hidden="true" className="size-3.5" />
                {t("alreadyInCart", { count: cartQuantity })}
              </span>
            ) : null}
          </div>
          <button aria-label={t("closeCustomizer")} className="grid size-9 shrink-0 place-items-center rounded-full text-muted transition-colors duration-200 hover:bg-[var(--soft-surface)] hover:text-ink" onClick={requestClose} type="button">
            <X aria-hidden="true" className="size-5" />
          </button>
        </div>

        {submitError || isAdded ? (
          <div
            className={cn("shrink-0 space-y-2 border-b border-line bg-surface px-5 py-3", styles.noticeEnter)}
            ref={noticeRegionRef}
            tabIndex={-1}
          >
            {submitError ? (
              <DeliveryNotice
                dismissLabel={t("dismissMessage")}
                message={submitError}
                onDismiss={() => setSubmitError(null)}
                tone="error"
              />
            ) : null}
            {isAdded ? (
              <DeliveryNotice
                dismissLabel={t("dismissMessage")}
                message={t("addedToCart")}
                onDismiss={() => setIsAdded(false)}
                tone="success"
              />
            ) : null}
          </div>
        ) : null}

        {info.isError || customizations.isError ? (
          <div className="m-5 rounded-xl border border-brand/30 bg-brand/5 p-4 text-sm text-brand" role="alert">
            {t("productLoadError")}
          </div>
        ) : (
          <form className="flex min-h-0 flex-1 flex-col" onSubmit={handleSubmit}>
            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-5">
              {isConfigurationLoading ? (
                <div className="grid min-h-40 place-items-center text-brand"><LoaderCircle aria-hidden="true" className="size-7 animate-spin" /></div>
              ) : null}
              {variationChoices.length ? (
                <fieldset
                  aria-invalid={hasSubmitted && missingGroups.includes("__variation__")}
                  className="rounded-xl border border-line p-3.5"
                  ref={(element) => {
                    if (element) groupRefs.current.set("__variation__", element);
                  }}
                  tabIndex={-1}
                >
                  <legend className="w-full text-sm font-bold text-ink">
                    <span className="flex justify-between gap-3">{t("chooseVariation")}<small className="font-medium text-brand">{t("required")}</small></span>
                  </legend>
                  <div className="divide-y divide-line">
                    {variationChoices.map((choice) => {
                      const key = `${choice.groupId}:${choice.optionId}`;
                      return (
                        <label className="flex cursor-pointer items-center gap-3 py-2.5 text-xs" key={key}>
                          <input checked={effectiveVariationKey === key} className="size-4 accent-[var(--color-brand)]" disabled={isInteractionLocked} name="variation" onChange={() => { setSelectedVariationKey(key); setIsAdded(false); }} type="radio" />
                          <span className="flex-1 text-ink">{choice.title}</span>
                          <span className="text-muted">{format.number(choice.price, { style: "currency", currency: "INR" })}</span>
                        </label>
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

            <div className="border-t border-line bg-surface p-5">
              {cart.data && !cart.data.isEmpty ? (
                <Link
                  className="mb-4 flex min-h-14 w-full items-center gap-3 rounded-xl bg-brand/8 px-4 text-brand transition-colors duration-200 hover:bg-brand/12 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
                  href="/cart"
                >
                  <span className="relative grid size-9 shrink-0 place-items-center rounded-full bg-brand text-white">
                    <ShoppingCart aria-hidden="true" className="size-4" />
                    <span className="absolute -right-1.5 -top-1.5 grid min-h-4 min-w-4 place-items-center rounded-full border-2 border-surface bg-ink px-1 text-[9px] font-extrabold leading-none text-surface tabular-nums">
                      {cart.data.totalItems > 99 ? "99+" : cart.data.totalItems}
                    </span>
                  </span>
                  <span className="min-w-0 flex-1 text-left">
                    <span className="block text-sm font-bold">{t("viewCart")}</span>
                    <span className="block text-xs text-body">
                      {t("itemCount", { count: cart.data.totalItems })}
                    </span>
                  </span>
                  <b className="shrink-0 text-sm tabular-nums">
                    {format.number(cart.data.finalPrice, {
                      style: "currency",
                      currency: "INR",
                    })}
                  </b>
                  <ChevronRight aria-hidden="true" className="size-4 shrink-0" />
                </Link>
              ) : null}
              <div className="mb-4 flex items-center justify-between gap-4">
                <div className="inline-flex items-center gap-3">
                  <button aria-label={t("decreaseQuantity")} className="grid size-9 place-items-center rounded-full border border-line text-ink disabled:cursor-not-allowed disabled:opacity-40" disabled={isInteractionLocked || quantity <= 1} onClick={() => setQuantity((value) => Math.max(1, value - 1))} type="button"><Minus aria-hidden="true" className="size-4" /></button>
                  <b className="min-w-5 text-center text-base">{quantity}</b>
                  <button aria-label={t("increaseQuantity")} className="grid size-9 place-items-center rounded-full border border-line text-ink disabled:cursor-not-allowed disabled:opacity-40" disabled={isInteractionLocked || quantity >= 99} onClick={() => setQuantity((value) => Math.min(99, value + 1))} type="button"><Plus aria-hidden="true" className="size-4" /></button>
                </div>
                <div className="text-right">
                  <small className="block text-xs text-muted">{t("total")}</small>
                  {isConfigurationLoading ? (
                    <span aria-hidden="true" className="mt-1 block h-5 w-24 animate-pulse rounded bg-[var(--soft-surface)]" />
                  ) : (
                    <b className="text-lg text-brand">{format.number(total, { style: "currency", currency: "INR" })}</b>
                  )}
                </div>
              </div>
              <button className="flex h-13 w-full items-center justify-center rounded-xl bg-brand px-5 text-sm font-bold text-white transition hover:bg-brand-deep disabled:cursor-not-allowed disabled:opacity-50" disabled={isInteractionLocked} type="submit">
                {isConfigurationLoading || (isAuthenticated && cart.isPending) || isMutationPending ? <LoaderCircle aria-hidden="true" className="mr-2 size-4 animate-spin" /> : null}
                {isConfigurationLoading || (isAuthenticated && cart.isPending)
                  ? isConfigurationLoading
                    ? t("loadingProduct")
                    : t("preparingCart")
                  : isMutationPending
                    ? t("addingToCart")
                    : product && !product.inStock
                      ? t("outOfStock")
                      : t("addToCart", { price: format.number(total, { style: "currency", currency: "INR" }) })}
              </button>
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
              <button className="h-11 flex-1 rounded-xl bg-brand text-sm font-bold text-white" disabled={isMutationPending} onClick={() => void replaceCart()} type="button">{t("replaceCart")}</button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
