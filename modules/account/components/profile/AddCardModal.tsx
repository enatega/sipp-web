"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CardCvcElement,
  CardExpiryElement,
  CardNumberElement,
  Elements,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useFormik } from "formik";
import { LoaderCircle, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { createSavedCardSchema } from "@/modules/account/schemas/savedCardSchema";
import type { SavedCardSetupIntent } from "@/modules/account/types";

const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripePromise = publishableKey ? loadStripe(publishableKey) : null;

interface AddCardFormProps {
  clientSecret: string;
  onClose: () => void;
  onSaved: () => void;
}

function AddCardForm({ clientSecret, onClose, onSaved }: AddCardFormProps) {
  const t = useTranslations("savedCards");
  const stripe = useStripe();
  const elements = useElements();
  const { resolvedTheme } = useTheme();
  const [isNumberComplete, setIsNumberComplete] = useState(false);
  const [isExpiryComplete, setIsExpiryComplete] = useState(false);
  const [isCvcComplete, setIsCvcComplete] = useState(false);
  const [cardError, setCardError] = useState("");

  const elementOptions = useMemo(
    () => ({
      style: {
        base: {
          color: resolvedTheme === "dark" ? "#f6f7f8" : "#14161a",
          fontFamily: "system-ui, sans-serif",
          fontSize: "13px",
          fontSmoothing: "antialiased",
          "::placeholder": {
            color: resolvedTheme === "dark" ? "#aeb4bd" : "#747983",
          },
        },
        invalid: { color: "#b7182f" },
      },
    }),
    [resolvedTheme],
  );

  const formik = useFormik({
    initialValues: { cardholderName: "" },
    validationSchema: createSavedCardSchema(t("cardholderRequired")),
    onSubmit: async (values, helpers) => {
      helpers.setStatus(undefined);
      setCardError("");

      if (!stripe || !elements) return;
      if (!isNumberComplete || !isExpiryComplete || !isCvcComplete) {
        setCardError(t("cardDetailsRequired"));
        return;
      }

      const cardNumber = elements.getElement(CardNumberElement);
      if (!cardNumber) {
        setCardError(t("addError"));
        return;
      }

      const result = await stripe.confirmCardSetup(clientSecret, {
        payment_method: {
          card: cardNumber,
          billing_details: { name: values.cardholderName.trim() },
        },
      });

      if (result.error) {
        helpers.setStatus(result.error.message || t("addError"));
        return;
      }

      onSaved();
    },
  });

  const fieldClass =
    "mt-2 min-h-12 rounded-full border border-line bg-[var(--soft-surface)] px-4 py-[14px] transition-colors focus-within:border-brand";

  return (
    <form onSubmit={formik.handleSubmit} className="px-6 pb-6 pt-5 sm:px-7">
      <label className="block text-[10px] font-semibold text-body">
        {t("cardNumber")}
        <div className={fieldClass}>
          <CardNumberElement
            options={{ ...elementOptions, showIcon: true }}
            onChange={(event) => {
              setIsNumberComplete(event.complete);
              setCardError(event.error?.message ?? "");
            }}
          />
        </div>
      </label>

      <label className="mt-4 block text-[10px] font-semibold text-body">
        {t("cardholderName")}
        <input
          id="cardholderName"
          name="cardholderName"
          autoComplete="cc-name"
          value={formik.values.cardholderName}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          placeholder={t("cardholderPlaceholder")}
          aria-invalid={Boolean(
            formik.errors.cardholderName &&
              (formik.touched.cardholderName || formik.submitCount),
          )}
          className="mt-2 min-h-12 w-full rounded-full border border-line bg-[var(--soft-surface)] px-4 text-[13px] text-foreground outline-none transition-colors placeholder:text-muted focus:border-brand"
        />
      </label>
      {formik.errors.cardholderName &&
      (formik.touched.cardholderName || formik.submitCount) ? (
        <p className="mt-1.5 text-[11px] text-brand">
          {formik.errors.cardholderName}
        </p>
      ) : null}

      <div className="mt-4 grid grid-cols-2 gap-3">
        <label className="block text-[10px] font-semibold text-body">
          {t("expiryDate")}
          <div className={fieldClass}>
            <CardExpiryElement
              options={elementOptions}
              onChange={(event) => {
                setIsExpiryComplete(event.complete);
                setCardError(event.error?.message ?? "");
              }}
            />
          </div>
        </label>
        <label className="block text-[10px] font-semibold text-body">
          {t("cvc")}
          <div className={fieldClass}>
            <CardCvcElement
              options={elementOptions}
              onChange={(event) => {
                setIsCvcComplete(event.complete);
                setCardError(event.error?.message ?? "");
              }}
            />
          </div>
        </label>
      </div>

      {cardError || formik.status ? (
        <p role="alert" className="mt-4 text-[11px] leading-relaxed text-brand">
          {cardError || String(formik.status)}
        </p>
      ) : null}

      <div className="mt-6 flex gap-2.5 border-t border-line pt-5">
        <button
          type="button"
          onClick={onClose}
          disabled={formik.isSubmitting}
          className="min-h-11 flex-1 rounded-xl border border-line text-[12px] font-semibold text-body transition-colors hover:bg-[var(--soft-surface)] disabled:opacity-50"
        >
          {t("cancel")}
        </button>
        <button
          type="submit"
          disabled={!stripe || !elements || formik.isSubmitting}
          className="inline-flex min-h-11 flex-[2] items-center justify-center gap-2 rounded-xl bg-brand px-5 text-[12px] font-semibold text-white transition-colors hover:bg-brand-deep disabled:cursor-wait disabled:opacity-55"
        >
          {formik.isSubmitting ? (
            <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
          ) : null}
          {formik.isSubmitting ? t("adding") : t("addCard")}
        </button>
      </div>
    </form>
  );
}

interface Props {
  open: boolean;
  setupIntent?: SavedCardSetupIntent;
  isLoading: boolean;
  error: string;
  onClose: () => void;
  onSaved: () => void;
}

export function AddCardModal({
  open,
  setupIntent,
  isLoading,
  error,
  onClose,
  onSaved,
}: Props) {
  const t = useTranslations("savedCards");

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isLoading) onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isLoading, onClose, open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[80] grid place-items-center bg-[rgba(20,10,14,0.66)] p-4 backdrop-blur-[1px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-card-title"
      onClick={(event) => {
        if (event.target === event.currentTarget && !isLoading) onClose();
      }}
    >
      <div className="w-full max-w-[410px] overflow-hidden rounded-2xl bg-card shadow-[0_28px_80px_rgba(20,10,14,0.34)]">
        <header className="flex items-center justify-between border-b border-line px-6 py-4 sm:px-7">
          <h2 id="add-card-title" className="text-[15px] font-semibold">
            {t("addNewCard")}
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            aria-label={t("close")}
            className="grid size-8 place-items-center rounded-full border border-line text-muted transition-colors hover:bg-[var(--soft-surface)] hover:text-foreground disabled:opacity-50"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </header>

        {!publishableKey ? (
          <p role="alert" className="px-7 py-8 text-[12px] text-brand">
            {t("stripeNotConfigured")}
          </p>
        ) : isLoading ? (
          <div role="status" className="flex min-h-64 items-center justify-center gap-3 text-sm text-muted">
            <LoaderCircle className="size-5 animate-spin text-brand" />
            {t("preparingForm")}
          </div>
        ) : error || !setupIntent ? (
          <p role="alert" className="px-7 py-8 text-[12px] text-brand">
            {error || t("addError")}
          </p>
        ) : (
          <Elements
            stripe={stripePromise}
            options={{ clientSecret: setupIntent.clientSecret }}
          >
            <AddCardForm
              clientSecret={setupIntent.clientSecret}
              onClose={onClose}
              onSaved={onSaved}
            />
          </Elements>
        )}
      </div>
    </div>
  );
}
