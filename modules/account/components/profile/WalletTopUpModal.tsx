"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { useFormik } from "formik";
import { ArrowRight, Check, CreditCard, LoaderCircle, Plus, X } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import * as yup from "yup";
import { useActionToast } from "@/components/shared/useActionToast";
import { useWalletTopUpMutation } from "@/modules/account/queries/useAccountQueries";
import { ApiError } from "@/services/api/client";
import type { SavedCard } from "@/modules/account/types";

const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripePromise = publishableKey ? loadStripe(publishableKey) : null;
const AMOUNTS = [500, 1000, 2500, 5000];

interface Props {
  open: boolean;
  cards: SavedCard[];
  initialAmount?: number | null;
  returnToCheckout?: boolean;
  onAddCard: () => void;
  onClose: () => void;
  onCompleted: () => void;
}

export function WalletTopUpModal({ open, cards, initialAmount = null, returnToCheckout = false, onAddCard, onClose, onCompleted }: Props) {
  const t = useTranslations("wallet");
  const format = useFormatter();
  const topUp = useWalletTopUpMutation();
  const notify = useActionToast();
  const [isConfirming, setIsConfirming] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const submitLock = useRef(false);
  const amountInput = useRef<HTMLInputElement>(null);
  const isBusy = topUp.isPending || isConfirming;
  const defaultCard = cards.find((card) => card.isDefault) ?? cards[0];
  const formik = useFormik({
    initialValues: { amount: "", paymentMethodId: "" },
    validationSchema: yup.object({
      amount: yup.string().required(t("topUpAmountRequired")).matches(/^\d+(?:\.\d{1,2})?$/, t("topUpAmountInvalid")).test("range", t("topUpAmountRange"), (value) => Number(value) >= 500 && Number(value) <= 999_999.99),
      paymentMethodId: yup.string().required(t("topUpChooseCard")),
    }),
    onSubmit: async (values) => {
      if (submitLock.current) return;
      submitLock.current = true;
      try {
        const result = await topUp.mutateAsync({ amount: Number(values.amount), paymentMethodId: values.paymentMethodId });
        let status = result.status;
        if (status === "requires_action") {
          if (!result.clientSecret || !stripePromise) throw new Error(t("topUpAuthenticationError"));
          setIsConfirming(true);
          const stripe = await stripePromise;
          if (!stripe) throw new Error(t("topUpAuthenticationError"));
          const next = await stripe.handleNextAction({ clientSecret: result.clientSecret });
          if (next.error) throw new Error(next.error.message || t("topUpError"));
          status = next.paymentIntent?.status ?? "";
        }
        if (status !== "succeeded" && status !== "processing") throw new Error(t("topUpError"));
        onCompleted();
        setIsCompleted(true);
        notify.success("walletToppedUp");
      } catch (error) {
        // Errors raised here carry translated or Stripe customer-facing text;
        // raw API errors are left to the toast helper's readability filter.
        const detail =
          error instanceof Error && !(error instanceof ApiError) && error.message !== t("topUpError")
            ? error.message
            : undefined;
        notify.error(error, "walletTopUpFailed", detail);
      } finally {
        setIsConfirming(false);
        submitLock.current = false;
      }
    },
  });

  function closeModal() {
    setIsCompleted(false);
    formik.resetForm();
    onClose();
  }

  useEffect(() => {
    const fallbackId = defaultCard?.id ?? "";
    if (open && fallbackId !== formik.values.paymentMethodId && !cards.some((card) => card.id === formik.values.paymentMethodId)) {
      void formik.setFieldValue("paymentMethodId", fallbackId);
    }
  }, [cards, defaultCard?.id, formik.setFieldValue, formik.values.paymentMethodId, open]);

  useEffect(() => {
    if (open && initialAmount !== null) {
      void formik.setFieldValue("amount", initialAmount.toFixed(2));
    }
  }, [open, initialAmount]);

  useEffect(() => {
    if (!open) return;
    amountInput.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isBusy) closeModal();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isBusy, open]);

  if (!open) return null;

  const amount = Number(formik.values.amount);
  const isValidAmount = /^\d+(?:\.\d{1,2})?$/.test(formik.values.amount) && amount >= 500 && amount <= 999_999.99;
  const isReady = isValidAmount && Boolean(formik.values.paymentMethodId) && Boolean(publishableKey) && !isBusy;
  const money = (value: number) => `₡ ${format.number(value, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/60 p-0 sm:items-center sm:p-5" role="dialog" aria-modal="true" aria-labelledby="wallet-topup-title" onClick={(event) => { if (event.target === event.currentTarget && !isBusy) closeModal(); }}>
      <div className="flex max-h-[94svh] w-full max-w-[500px] flex-col overflow-y-auto rounded-t-[28px] bg-card px-5 pb-[max(24px,env(safe-area-inset-bottom))] pt-5 shadow-[0_28px_80px_rgba(0,0,0,0.28)] sm:rounded-[28px] sm:px-7 sm:py-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="wallet-topup-title" className="text-2xl font-bold tracking-[-0.025em] text-ink">{t("topUpTitle")}</h2>
            <p className="mt-1 text-sm text-muted">{t("topUpDescription")}</p>
          </div>
          <button aria-label={t("topUpClose")} className="grid size-10 shrink-0 place-items-center rounded-full bg-soft-surface text-body hover:text-ink" disabled={isBusy} onClick={closeModal} type="button"><X aria-hidden="true" className="size-5" /></button>
        </div>

        {isCompleted ? (
          <div className="mt-8" role="status">
            <span className="grid size-14 place-items-center rounded-2xl bg-success-soft text-success"><Check aria-hidden="true" className="size-7" /></span>
            <h3 className="mt-4 text-xl font-bold text-ink">{t("topUpSubmitted")}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">{t("topUpPendingBalance")}</p>
            {returnToCheckout ? <Link className="mt-7 inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-brand font-semibold text-ink" href="/checkout" onClick={closeModal}>{t("returnToCheckout")}</Link> : null}
            <button className={`${returnToCheckout ? "mt-2" : "mt-7"} min-h-12 w-full rounded-2xl border border-line font-semibold text-ink`} onClick={closeModal} type="button">{t("topUpDone")}</button>
          </div>
        ) : (
          <form className="mt-7" noValidate onSubmit={formik.handleSubmit}>
            <p className="text-sm font-semibold text-ink">{t("topUpPaymentMethod")}</p>
            {cards.length ? (
              <div className="mt-3 space-y-2" role="radiogroup" aria-label={t("topUpPaymentMethod")}>
                {cards.map((card) => (
                  <label className={`flex min-h-16 cursor-pointer items-center gap-3 rounded-2xl border px-4 transition-colors ${formik.values.paymentMethodId === card.id ? "border-brand bg-brand/10" : "border-line bg-soft-surface hover:border-brand/50"}`} key={card.id}>
                    <input className="accent-brand" checked={formik.values.paymentMethodId === card.id} disabled={isBusy} name="paymentMethodId" onChange={() => void formik.setFieldValue("paymentMethodId", card.id)} type="radio" value={card.id} />
                    <CreditCard aria-hidden="true" className="size-5 shrink-0 text-brand" />
                    <span className="min-w-0 flex-1 text-sm font-semibold text-ink">{card.brand.toUpperCase()} •••• {card.last4}<span className="block text-xs font-normal text-muted">{String(card.expMonth).padStart(2, "0")}/{String(card.expYear).slice(-2)}</span></span>
                    {card.isDefault ? <span className="text-xs font-medium text-muted">{t("defaultCard")}</span> : null}
                  </label>
                ))}
              </div>
            ) : <p className="mt-3 rounded-2xl bg-soft-surface p-4 text-sm text-muted">{t("topUpNoCards")}</p>}
            <button className="mt-2 inline-flex min-h-11 w-full items-center gap-2 rounded-2xl bg-brand/10 px-4 text-sm font-semibold text-brand hover:bg-brand/15" disabled={isBusy} onClick={onAddCard} type="button"><Plus aria-hidden="true" className="size-4" />{t("addCard")}</button>

            <label className="mt-7 block text-sm font-semibold text-ink" htmlFor="wallet-topup-amount">{t("topUpAmount")}</label>
            <div className="mt-2 flex h-20 items-center gap-2 rounded-2xl border border-line bg-soft-surface px-5 focus-within:border-brand">
              <span className="text-3xl font-bold text-ink">₡</span>
              <input ref={amountInput} autoComplete="off" className="min-w-0 flex-1 bg-transparent text-3xl font-semibold tabular-nums text-ink outline-none placeholder:text-muted" disabled={isBusy} id="wallet-topup-amount" inputMode="decimal" name="amount" onBlur={formik.handleBlur} onChange={(event) => { const next = event.target.value.replace(",", "."); if (/^\d*(?:\.\d{0,2})?$/.test(next)) void formik.setFieldValue("amount", next); }} placeholder="0" value={formik.values.amount} />
            </div>
            <p className={`mt-2 text-xs ${formik.values.amount && !isValidAmount ? "text-danger" : "text-muted"}`}>{amount > 999_999.99 ? t("topUpAmountRange") : t("topUpMinimum")}</p>
            <div className="mt-4 grid grid-cols-4 gap-2">
              {AMOUNTS.map((preset) => <button aria-pressed={amount === preset} className={`min-h-11 rounded-xl border px-1 text-xs font-semibold tabular-nums transition-colors ${amount === preset ? "border-brand bg-brand text-ink" : "border-line bg-soft-surface text-body hover:border-brand/50"}`} disabled={isBusy} key={preset} onClick={() => void formik.setFieldValue("amount", String(preset))} type="button">₡ {format.number(preset)}</button>)}
            </div>
            {formik.submitCount && (formik.errors.amount || formik.errors.paymentMethodId) ? <p className="mt-3 text-sm text-danger" role="alert">{formik.errors.amount || formik.errors.paymentMethodId}</p> : null}
            {!publishableKey ? <p className="mt-3 text-sm text-danger" role="alert">{t("topUpUnavailable")}</p> : null}
            <button className="mt-8 inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-brand px-4 text-base font-semibold text-ink transition-colors hover:bg-brand/85 disabled:cursor-not-allowed disabled:bg-soft-surface disabled:text-muted" disabled={!isReady} type="submit">
              {isBusy ? <LoaderCircle aria-hidden="true" className="size-5 animate-spin" /> : null}
              {isBusy ? t("topUpProcessing") : isValidAmount ? t("topUpSubmitAmount", { amount: money(amount) }) : t("topUpSubmit")}
              {!isBusy && isReady ? <ArrowRight aria-hidden="true" className="size-5" /> : null}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
