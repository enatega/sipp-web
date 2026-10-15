"use client";

import { useEffect, useRef } from "react";
import { CircleCheckBig, LoaderCircle, WalletCards, XCircle } from "lucide-react";
import { useTranslations } from "next-intl";

export type CancelOrderStage = "confirm" | "processing" | "success";

interface Props {
  error: boolean;
  refundAmount?: string;
  stage: CancelOrderStage;
  onClose: () => void;
  onConfirm: () => void;
}

export function CancelOrderDialog({
  error,
  refundAmount,
  stage,
  onClose,
  onConfirm,
}: Props) {
  const t = useTranslations("deliveries.orderDetails");
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (stage === "success") closeRef.current?.focus();
  }, [stage]);

  const isProcessing = stage === "processing";
  const isSuccess = stage === "success";

  return (
    <div
      aria-labelledby="cancel-order-title"
      aria-modal="true"
      className="fixed inset-0 z-[80] grid place-items-center bg-black/55 p-5 backdrop-blur-[2px]"
      role="dialog"
    >
      <div className="w-full max-w-sm rounded-3xl border border-line bg-card p-6 shadow-pop sm:p-7">
        <span
          className={`grid size-14 place-items-center rounded-full ${
            isSuccess
              ? "bg-success-soft text-success"
              : isProcessing
                ? "bg-brand/10 text-brand"
                : "bg-danger-soft text-danger"
          }`}
        >
          {isSuccess ? (
            <CircleCheckBig aria-hidden="true" className="size-7" />
          ) : isProcessing ? (
            <LoaderCircle aria-hidden="true" className="size-7 animate-spin" />
          ) : (
            <XCircle aria-hidden="true" className="size-7" />
          )}
        </span>

        <h2 className="mt-5 text-xl font-bold text-ink" id="cancel-order-title">
          {isSuccess
            ? refundAmount
              ? t("cancelRefundSuccessTitle")
              : t("cancelSuccessTitle")
            : isProcessing
              ? t("cancellingOrderTitle")
              : t("cancelOrderTitle")}
        </h2>
        <p className="mt-2 text-sm leading-6 text-body">
          {isSuccess
            ? refundAmount
              ? t("cancelRefundSuccessMessage", { amount: refundAmount })
              : t("cancelSuccessMessage")
            : isProcessing
              ? t("cancellingOrderMessage")
              : t("cancelOrderMessage")}
        </p>

        {isSuccess && refundAmount ? (
          <div className="mt-5 flex items-center gap-3 rounded-2xl bg-success-soft p-4 text-success">
            <WalletCards aria-hidden="true" className="size-5 shrink-0" />
            <div>
              <p className="text-xs font-semibold">{t("walletRefundLabel")}</p>
              <p className="mt-0.5 text-lg font-bold">{refundAmount}</p>
            </div>
          </div>
        ) : null}

        {error ? (
          <p className="mt-4 rounded-xl bg-danger-soft px-4 py-3 text-sm font-medium text-danger" role="alert">
            {t("cancelOrderError")}
          </p>
        ) : null}

        {stage === "confirm" ? (
          <div className="mt-6 flex justify-end gap-2">
            <button
              className="min-h-10 rounded-full px-4 text-sm font-semibold text-body hover:bg-[var(--soft-surface)]"
              onClick={onClose}
              type="button"
            >
              {t("keepOrder")}
            </button>
            <button
              className="min-h-10 rounded-full bg-danger px-5 text-sm font-bold text-white hover:opacity-90"
              onClick={onConfirm}
              type="button"
            >
              {t("confirmCancelOrder")}
            </button>
          </div>
        ) : isProcessing ? (
          <p className="mt-5 text-xs font-medium text-muted" role="status">
            {t("cancellingOrderHint")}
          </p>
        ) : (
          <button
            className="mt-6 min-h-11 w-full rounded-full bg-brand px-5 text-sm font-bold text-ink hover:bg-brand/85"
            onClick={onClose}
            ref={closeRef}
            type="button"
          >
            {t("viewCancelledOrder")}
          </button>
        )}
      </div>
    </div>
  );
}
