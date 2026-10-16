"use client";

import { useEffect, useRef, useState } from "react";
import { CircleCheckBig, LoaderCircle, ReceiptText } from "lucide-react";
import { useTranslations } from "next-intl";

export type CheckoutProgressStage = "placing" | "checking" | "success";

interface Props {
  navigationAttempted?: boolean;
  orderId?: string;
  paymentMethod: "wallet" | "stripe";
  stage: CheckoutProgressStage;
  onViewOrder: () => void;
}

export function CheckoutOrderProgressDialog({
  navigationAttempted = false,
  orderId,
  paymentMethod,
  stage,
  onViewOrder,
}: Props) {
  const t = useTranslations("deliveries.checkout");
  const actionRef = useRef<HTMLButtonElement>(null);
  const [isTakingLonger, setIsTakingLonger] = useState(false);

  useEffect(() => {
    if (stage === "success") {
      actionRef.current?.focus();
      return;
    }
    if (stage !== "placing") return;
    const timeout = window.setTimeout(() => setIsTakingLonger(true), 8_000);
    return () => window.clearTimeout(timeout);
  }, [stage]);

  const isSuccess = stage === "success";
  const title = isSuccess
    ? paymentMethod === "stripe"
      ? t("paymentSuccessTitle")
      : t("orderSuccessTitle")
    : navigationAttempted
      ? t("paymentNavigationBlockedTitle")
      : stage === "checking"
      ? t("checkingOrderTitle")
      : isTakingLonger
        ? t("orderTakingLongerTitle")
        : t("placingOrderTitle");
  const message = isSuccess
    ? paymentMethod === "stripe"
      ? t("paymentSuccessMessage")
      : t("orderSuccessMessage")
    : navigationAttempted
      ? t("paymentNavigationBlockedMessage")
      : stage === "checking"
      ? t("checkingOrderMessage")
      : isTakingLonger
        ? t("orderTakingLongerMessage")
        : t("placingOrderMessage");

  return (
    <div
      aria-labelledby="checkout-progress-title"
      aria-modal="true"
      className="fixed inset-0 z-[100] grid place-items-center bg-black/55 p-4 backdrop-blur-[2px]"
      role="dialog"
    >
      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-line bg-card shadow-pop">
        <div className="relative px-6 pb-7 pt-8 text-center sm:px-8">
          <div className="absolute inset-x-0 top-0 h-1 bg-brand/20">
            <span
              className={`block h-full bg-brand ${isSuccess ? "w-full" : "w-2/3 animate-pulse"}`}
            />
          </div>
          <span
            className={`mx-auto grid size-16 place-items-center rounded-full ${
              isSuccess
                ? "bg-success-soft text-success"
                : "bg-brand/10 text-brand"
            }`}
          >
            {isSuccess ? (
              <CircleCheckBig aria-hidden="true" className="size-8" />
            ) : (
              <LoaderCircle aria-hidden="true" className="size-8 animate-spin" />
            )}
          </span>
          <h2
            className="mt-5 text-2xl font-bold tracking-[-0.02em] text-ink"
            id="checkout-progress-title"
          >
            {title}
          </h2>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-body">
            {message}
          </p>

          {isSuccess && orderId ? (
            <div className="mt-5 flex items-center justify-center gap-2 rounded-2xl bg-[var(--soft-surface)] px-4 py-3 text-sm text-body">
              <ReceiptText aria-hidden="true" className="size-4 text-brand" />
              <span>{t("orderReference", { code: orderId.split("-")[0].toUpperCase() })}</span>
            </div>
          ) : null}

          {isSuccess ? (
            <button
              className="mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-full bg-brand px-6 text-sm font-bold text-ink transition-colors hover:bg-brand/85 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand/20"
              onClick={onViewOrder}
              ref={actionRef}
              type="button"
            >
              {t("viewOrder")}
            </button>
          ) : (
            <p className="mt-5 text-xs font-medium text-muted" role="status">
              {t("doNotRetryOrder")}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
