"use client";

import { FormEvent, KeyboardEvent, useEffect, useMemo, useRef, useState } from "react";
import { CardElement, Elements, useElements, useStripe } from "@stripe/react-stripe-js";
import { loadStripe, type StripeCardElementOptions, type StripeElementsOptions } from "@stripe/stripe-js";
import { CreditCard, LoaderCircle, LockKeyhole, X } from "lucide-react";
import { useFormatter, useLocale, useTranslations } from "next-intl";
import { resolveCurrencySymbol } from "@/config/currency";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import type { SavedCard } from "@/modules/account";
import type { StripePaymentQuote } from "../../types/checkout";
import styles from "./checkout-transitions.module.css";

const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripePromise = publishableKey ? loadStripe(publishableKey) : null;

interface PaymentFormProps {
  billingDetails: { name: string; email?: string; phone?: string };
  clientSecret: string;
  isDark: boolean;
  total: number;
  paymentQuote: StripePaymentQuote;
  onConfirmed: () => void;
  onProcessingChange: (isProcessing: boolean) => void;
  selectedCard: SavedCard | null;
}

function PaymentForm({
  billingDetails,
  clientSecret,
  isDark,
  total,
  paymentQuote,
  onConfirmed,
  onProcessingChange,
  selectedCard,
}: PaymentFormProps) {
  const t = useTranslations("deliveries.checkout");
  const savedCardsT = useTranslations("savedCards");
  const format = useFormatter();
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCardComplete, setIsCardComplete] = useState(false);
  const cardOptions = useMemo<StripeCardElementOptions>(
    () => ({
      hidePostalCode: true,
      disableLink: true,
      style: {
        base: {
          color: isDark ? "#f6f7f8" : "#14161a",
          fontFamily: "system-ui, sans-serif",
          fontSize: "16px",
          "::placeholder": { color: isDark ? "#aeb4bd" : "#747983" },
        },
        invalid: { color: "#e33935" },
      },
    }),
    [isDark],
  );
  const usdSymbol = resolveCurrencySymbol(undefined, paymentQuote.paymentCurrency);
  const businessSymbol = resolveCurrencySymbol(paymentQuote.businessCurrencySymbol, paymentQuote.businessCurrencyCode);
  const usdTotal = `${usdSymbol} ${format.number(paymentQuote.paymentAmount, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const businessTotal = `${businessSymbol} ${format.number(total, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!stripe || !elements || isSubmitting) return;
    const card = selectedCard ? null : elements.getElement(CardElement);
    if (!selectedCard && (!card || !isCardComplete)) {
      setError(savedCardsT("cardDetailsRequired"));
      return;
    }

    setError("");
    setIsSubmitting(true);
    onProcessingChange(true);

    try {
      let result;
      if (selectedCard) {
        result = await stripe.handleNextAction({ clientSecret });
      } else {
        result = await stripe.confirmCardPayment(clientSecret, {
          payment_method: { card: card!, billing_details: billingDetails },
        });
      }

      if (result.error) {
        setError(result.error.message || t("cardPaymentError"));
        return;
      }

      if (
        result.paymentIntent?.status === "succeeded" ||
        result.paymentIntent?.status === "processing"
      ) {
        onConfirmed();
        return;
      }

      setError(t("cardPaymentError"));
    } catch {
      setError(t("cardPaymentError"));
    } finally {
      setIsSubmitting(false);
      onProcessingChange(false);
    }
  }

  return (
    <form aria-busy={isSubmitting} className="mt-5" onSubmit={handleSubmit}>
      {selectedCard ? (
        <div className="flex items-center gap-3 rounded-xl bg-[var(--soft-surface)] p-4">
          <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-brand/10 text-brand"><CreditCard aria-hidden="true" className="size-5" /></span>
          <span className="min-w-0"><strong className="block truncate text-sm text-ink">{selectedCard.brand.toUpperCase()} •••• {selectedCard.last4}</strong><small className="mt-0.5 block text-xs text-muted">{t("payingWithSavedCard")}</small></span>
        </div>
      ) : (
        <div aria-label={t("cardPaymentTitle")} className="rounded-xl border border-line bg-[var(--soft-surface)] px-4 py-4 focus-within:border-brand focus-within:ring-4 focus-within:ring-brand/10" role="group">
          <CardElement
            options={cardOptions}
            onChange={(event) => {
              setIsCardComplete(event.complete);
              setError(event.error?.message ?? "");
            }}
          />
        </div>
      )}
      <dl className="mt-5 grid gap-2 rounded-xl bg-[var(--soft-surface)] p-4 text-sm">
        <div className="flex items-center justify-between gap-4">
          <dt className="text-muted">{t("businessOrderTotal")}</dt>
          <dd className="font-semibold tabular-nums text-ink">
            {businessTotal}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-4">
          <dt className="text-muted">{t("stripeCharge")}</dt>
          <dd className="font-bold tabular-nums text-ink">{usdTotal}</dd>
        </div>
        <div className="flex items-start justify-between gap-4 border-t border-line pt-2 text-xs">
          <dt className="text-muted">{t("conversionRate")}</dt>
          <dd className="text-end font-medium tabular-nums text-body">
            {t("conversionRateValue", {
              rate: format.number(paymentQuote.localCurrencyUnitsPerUsd, {
                maximumFractionDigits: 6,
              }),
              currency: businessSymbol,
            })}
          </dd>
        </div>
      </dl>
      {error ? (
        <p className="mt-4 rounded-xl bg-brand/8 p-3 text-xs font-medium leading-5 text-brand" role="alert">
          {error}
        </p>
      ) : null}
      <button
        className="mt-5 inline-flex min-h-13 w-full items-center justify-center gap-2 rounded-xl bg-brand px-5 text-sm font-bold text-ink transition-colors hover:bg-brand/85 disabled:cursor-wait disabled:opacity-55"
        disabled={!stripe || !elements || isSubmitting}
        type="submit"
      >
        {isSubmitting ? <LoaderCircle aria-hidden="true" className="size-4 animate-spin" /> : <LockKeyhole aria-hidden="true" className="size-4" />}
        {isSubmitting
          ? t("processingCard")
          : t("payNow", {
              total: usdTotal,
            })}
      </button>
    </form>
  );
}

interface Props {
  billingDetails: { name: string; email?: string; phone?: string };
  clientSecret: string;
  error: string;
  isFinalizing: boolean;
  onClose: () => void;
  onConfirmed: () => void;
  total: number;
  paymentQuote: StripePaymentQuote | null;
  selectedCard: SavedCard | null;
}

export function StripePaymentModal({
  billingDetails,
  clientSecret,
  error,
  isFinalizing,
  onClose,
  onConfirmed,
  selectedCard,
  total,
  paymentQuote,
}: Props) {
  const t = useTranslations("deliveries.checkout");
  const locale = useLocale();
  const { resolvedTheme } = useTheme();
  const panelRef = useRef<HTMLDivElement>(null);
  const [isClosing, setIsClosing] = useState(false);
  const [isPaymentSubmitting, setIsPaymentSubmitting] = useState(false);
  const isPaymentLocked = isPaymentSubmitting || isFinalizing;
  const canClose = !isPaymentLocked;
  const isDark = resolvedTheme === "dark";
  const options = useMemo<StripeElementsOptions>(
    () => ({
      clientSecret,
      locale: locale === "de" ? "de" : "en",
      loader: "auto",
      appearance: {
        theme: isDark ? "night" : "stripe",
        variables: {
          colorPrimary: "#66c0f2",
          colorBackground: isDark ? "#1d2127" : "#ffffff",
          colorText: isDark ? "#f6f7f8" : "#14161a",
          colorDanger: "#e33935",
          borderRadius: "12px",
          fontFamily: "system-ui, sans-serif",
          spacingUnit: "4px",
        },
        rules: {
          ".Input": {
            border: `1px solid ${isDark ? "#30353d" : "#ecedf1"}`,
            boxShadow: "none",
          },
          ".Input:focus": {
            borderColor: "#66c0f2",
            boxShadow: "0 0 0 3px rgba(102, 192, 242, 0.1)",
          },
        },
      },
    }),
    [clientSecret, isDark, locale],
  );

  useEffect(() => {
    const handleEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape" && canClose) setIsClosing(true);
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [canClose]);

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
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

  return (
    <div
      className={cn(
        "fixed inset-0 z-[80] grid place-items-center bg-black/60 p-3 sm:p-6",
        isClosing ? styles.backdropExit : styles.backdropEnter,
      )}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && canClose) setIsClosing(true);
      }}
    >
      <div
        aria-labelledby="stripe-payment-title"
        aria-modal="true"
        aria-busy={isPaymentLocked}
        className={cn(
          "max-h-[min(760px,94vh)] w-full max-w-lg overflow-y-auto rounded-2xl bg-card p-5 shadow-pop outline-none sm:p-6",
          isClosing ? styles.dialogExit : styles.dialogEnter,
        )}
        onAnimationEnd={(event) => {
          if (isClosing && canClose && event.currentTarget === event.target) onClose();
        }}
        onKeyDown={handleKeyDown}
        ref={panelRef}
        role="dialog"
        tabIndex={-1}
      >
        <header className="flex items-start gap-3 border-b border-line pb-4">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand/10 text-brand">
            <CreditCard aria-hidden="true" className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-bold text-ink" id="stripe-payment-title">
              {t("cardPaymentTitle")}
            </h2>
            <p className="mt-1 text-xs leading-5 text-muted">
              {t("cardPaymentDescription")}
            </p>
          </div>
          <button
            aria-label={t("closeCardPayment")}
            autoFocus
            className="grid size-9 shrink-0 place-items-center rounded-full text-muted transition-colors hover:bg-[var(--soft-surface)] hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
            disabled={!canClose}
            onClick={() => setIsClosing(true)}
            type="button"
          >
            <X aria-hidden="true" className="size-5" />
          </button>
        </header>

        {!publishableKey || !stripePromise ? (
          <p className="mt-5 rounded-xl bg-brand/8 p-4 text-sm text-brand" role="alert">
            {t("stripeNotConfigured")}
          </p>
        ) : isFinalizing ? (
          <div className="grid min-h-64 place-items-center text-center" role="status">
            <div>
              <LoaderCircle aria-hidden="true" className="mx-auto size-8 animate-spin text-brand" />
              <h3 className="mt-5 text-base font-bold text-ink">
                {t("confirmingPayment")}
              </h3>
              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-body">
                {t("confirmingPaymentHint")}
              </p>
            </div>
          </div>
        ) : error ? (
          <div className="py-8 text-center" role="alert">
            <h3 className="text-base font-bold text-ink">{t("paymentConfirmationDelayedTitle")}</h3>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-body">{error}</p>
            <button className="mt-5 min-h-11 rounded-xl border border-brand/25 px-5 text-sm font-bold text-brand hover:bg-brand/5" onClick={() => setIsClosing(true)} type="button">
              {t("close")}
            </button>
          </div>
        ) : !paymentQuote ? (
          <p className="mt-5 rounded-xl bg-brand/8 p-4 text-sm text-brand" role="alert">
            {t("paymentQuoteUnavailable")}
          </p>
        ) : (
          <Elements key={`${clientSecret}:${isDark}:${locale}`} options={options} stripe={stripePromise}>
            <PaymentForm
              billingDetails={billingDetails}
              clientSecret={clientSecret}
              isDark={isDark}
              onConfirmed={onConfirmed}
              onProcessingChange={(isProcessing) => {
                if (isProcessing) setIsClosing(false);
                setIsPaymentSubmitting(isProcessing);
              }}
              selectedCard={selectedCard}
              total={total}
              paymentQuote={paymentQuote}
            />
          </Elements>
        )}

        <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-[11px] leading-5 text-muted">
          <LockKeyhole aria-hidden="true" className="size-3.5 shrink-0" />
          {t("stripeSecurityNote")}
        </p>
      </div>
    </div>
  );
}
