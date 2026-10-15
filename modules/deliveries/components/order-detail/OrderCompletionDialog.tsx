"use client";

import { type KeyboardEvent as ReactKeyboardEvent, useEffect, useRef } from "react";
import { CircleCheckBig, Star, X } from "lucide-react";
import { useTranslations } from "next-intl";

interface Props {
  storeName: string;
  orderType?: string;
  onClose: () => void;
  onRateOrder: () => void;
}

export function OrderCompletionDialog({
  storeName,
  orderType,
  onClose,
  onRateOrder,
}: Props) {
  const t = useTranslations("deliveries.orderDetails");
  const panelRef = useRef<HTMLDivElement>(null);
  const rateButtonRef = useRef<HTMLButtonElement>(null);
  const isPickup = orderType?.trim().toLowerCase() === "pickup";

  useEffect(() => {
    rateButtonRef.current?.focus();

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  function trapFocus(event: ReactKeyboardEvent<HTMLDivElement>) {
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

  return (
    <div
      aria-labelledby="order-completion-title"
      aria-modal="true"
      className="fixed inset-0 z-[90] grid place-items-center bg-black/55 p-4 backdrop-blur-[2px]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      role="dialog"
    >
      <div
        className="relative w-full max-w-md overflow-hidden rounded-3xl bg-card p-6 shadow-pop sm:p-8"
        onKeyDown={trapFocus}
        ref={panelRef}
      >
        <button
          aria-label={t("closeCompletion")}
          className="absolute end-4 top-4 grid size-10 place-items-center rounded-full text-muted transition-colors hover:bg-[var(--soft-surface)] hover:text-ink focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand/20"
          onClick={onClose}
          type="button"
        >
          <X aria-hidden="true" className="size-5" />
        </button>

        <span className="grid size-16 place-items-center rounded-full bg-success-soft text-success">
          <CircleCheckBig aria-hidden="true" className="size-8" />
        </span>
        <h2
          className="mt-5 pe-10 text-2xl font-bold tracking-[-0.02em] text-ink"
          id="order-completion-title"
        >
          {isPickup
            ? t("pickupCompletionTitle")
            : t("deliveryCompletionTitle")}
        </h2>
        <p className="mt-2 text-sm leading-6 text-body">
          {isPickup
            ? t("pickupCompletionMessage", { store: storeName })
            : t("deliveryCompletionMessage", { store: storeName })}
        </p>

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            className="min-h-11 rounded-full px-5 text-sm font-semibold text-body transition-colors hover:bg-[var(--soft-surface)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand/15"
            onClick={onClose}
            type="button"
          >
            {t("rateLater")}
          </button>
          <button
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-brand px-6 text-sm font-bold text-ink transition-[background-color,transform] hover:-translate-y-0.5 hover:bg-brand/85 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand/20"
            onClick={onRateOrder}
            ref={rateButtonRef}
            type="button"
          >
            <Star aria-hidden="true" className="size-4" />
            {t("rateOrder")}
          </button>
        </div>
      </div>
    </div>
  );
}
