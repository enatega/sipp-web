"use client";

import { KeyboardEvent, useEffect, useRef, useState } from "react";
import { useFormik } from "formik";
import { Check, LoaderCircle, Star, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { orderReviewSchema } from "../../schemas/orderReviewSchema";
import type { OrderReview } from "../../types/orders";
import { useSubmitOrderReview } from "../../hooks/useOrderDetail";
import styles from "./order-detail-transitions.module.css";

interface Props {
  orderId: string;
  review?: OrderReview;
  storeName: string;
  onClose: () => void;
}

export function OrderReviewDrawer({ orderId, review, storeName, onClose }: Props) {
  const t = useTranslations("deliveries.orderDetails");
  const panelRef = useRef<HTMLDivElement>(null);
  const mutation = useSubmitOrderReview();
  const [isSaved, setIsSaved] = useState(Boolean(review?.is_reviewed));
  const canClose = !mutation.isPending;
  const existingRating = review?.review_detail?.rating ?? 0;
  const existingDescription = review?.review_detail?.description ?? "";
  const formik = useFormik({
    initialValues: {
      rating: existingRating,
      description: existingDescription,
    },
    validationSchema: orderReviewSchema({
      ratingRequired: t("ratingRequired"),
      reviewTooLong: t("reviewTooLong"),
    }),
    onSubmit: async (values) => {
      await mutation.mutateAsync({
        orderId,
        rating: values.rating,
        description: values.description.trim() || undefined,
      });
      setIsSaved(true);
    },
  });

  useEffect(() => {
    const handleEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape" && canClose) onClose();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [canClose, onClose]);

  function trapFocus(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "Tab") return;
    const controls = panelRef.current?.querySelectorAll<HTMLElement>(
      'button:not([disabled]), textarea:not([disabled]), [href], [tabindex="0"]',
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
      className={`fixed inset-0 z-[80] flex justify-end bg-black/55 ${styles.backdrop}`}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && canClose) onClose();
      }}
    >
      <div
        aria-busy={mutation.isPending}
        aria-labelledby="order-review-title"
        aria-modal="true"
        className={`h-full w-full max-w-md overflow-y-auto bg-card p-5 shadow-[0_20px_60px_rgba(0,0,0,0.28)] sm:p-7 ${styles.drawer}`}
        onKeyDown={trapFocus}
        ref={panelRef}
        role="dialog"
        tabIndex={-1}
      >
        <header className="flex items-start justify-between gap-4 border-b border-line pb-5">
          <div>
            <h2 className="text-xl font-bold text-ink" id="order-review-title">
              {isSaved ? t("yourReview") : t("rateOrder")}
            </h2>
            <p className="mt-1 text-sm text-body">{storeName}</p>
          </div>
          <button
            aria-label={t("closeReview")}
            autoFocus
            className="grid size-10 shrink-0 place-items-center rounded-full text-muted transition-colors hover:bg-[var(--soft-surface)] hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
            disabled={!canClose}
            onClick={onClose}
            type="button"
          >
            <X aria-hidden="true" className="size-5" />
          </button>
        </header>

        {isSaved ? (
          <div className="py-10 text-center">
            <span className="mx-auto grid size-14 place-items-center rounded-full bg-success-soft text-success">
              <Check aria-hidden="true" className="size-7" />
            </span>
            <h3 className="mt-5 text-xl font-bold text-ink">
              {review?.is_reviewed ? t("reviewShared") : t("reviewThanks")}
            </h3>
            <div className="mt-5 flex justify-center gap-1" aria-label={t("ratingValue", { rating: formik.values.rating })}>
              {[1, 2, 3, 4, 5].map((rating) => (
                <Star
                  aria-hidden="true"
                  className={rating <= formik.values.rating ? "size-6 fill-gold text-gold" : "size-6 text-line"}
                  key={rating}
                />
              ))}
            </div>
            {formik.values.description ? (
              <p className="mx-auto mt-5 max-w-sm text-sm leading-6 text-body">
                {formik.values.description}
              </p>
            ) : null}
            <button
              className="mt-8 min-h-11 rounded-full bg-brand px-6 text-sm font-bold text-ink transition-colors hover:bg-brand/85"
              onClick={onClose}
              type="button"
            >
              {t("done")}
            </button>
          </div>
        ) : (
          <form className="pt-7" onSubmit={formik.handleSubmit}>
            <fieldset>
              <legend className="text-center text-sm font-semibold text-ink">{t("ratingQuestion")}</legend>
              <div className="mt-4 flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    aria-label={t("setRating", { rating })}
                    className="grid size-11 place-items-center rounded-full transition-[background-color,transform] hover:-translate-y-0.5 hover:bg-[var(--soft-surface)] focus-visible:outline-2 focus-visible:outline-offset-2"
                    key={rating}
                    onClick={() => void formik.setFieldValue("rating", rating)}
                    type="button"
                  >
                    <Star
                      aria-hidden="true"
                      className={rating <= formik.values.rating ? "size-7 fill-gold text-gold" : "size-7 text-line"}
                    />
                  </button>
                ))}
              </div>
            </fieldset>
            {formik.submitCount > 0 && formik.errors.rating ? (
              <p className="mt-2 text-center text-xs text-danger" role="alert">{formik.errors.rating}</p>
            ) : null}

            <label className="mt-7 block text-sm font-semibold text-ink" htmlFor="order-review-description">
              {t("reviewLabel")}
            </label>
            <textarea
              className="mt-2 min-h-32 w-full resize-none rounded-xl border border-line bg-surface p-3 text-base text-ink outline-none transition-[border-color,box-shadow] placeholder:text-muted focus:border-brand focus:ring-4 focus:ring-brand/10"
              id="order-review-description"
              maxLength={500}
              name="description"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              placeholder={t("reviewPlaceholder")}
              value={formik.values.description}
            />
            <div className="mt-1 flex justify-between gap-4 text-xs">
              <span className="text-danger" role={formik.touched.description && formik.errors.description ? "alert" : undefined}>
                {formik.touched.description ? formik.errors.description : ""}
              </span>
              <span className="shrink-0 tabular-nums text-muted">{formik.values.description.length}/500</span>
            </div>

            {mutation.isError ? (
              <p className="mt-4 rounded-xl bg-danger-soft p-3 text-sm text-danger" role="alert">
                {t("reviewError")}
              </p>
            ) : null}

            <button
              className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-brand px-5 text-sm font-bold text-ink transition-colors hover:bg-brand/85 disabled:cursor-wait disabled:opacity-55"
              disabled={!formik.isValid || mutation.isPending}
              type="submit"
            >
              {mutation.isPending ? <LoaderCircle aria-hidden="true" className="size-4 animate-spin" /> : null}
              {mutation.isPending ? t("submittingReview") : t("submitReview")}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
