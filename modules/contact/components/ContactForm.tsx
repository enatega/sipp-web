"use client";

import { Form, Formik } from "formik";
import { useEffect, useMemo, useState } from "react";
import { LoaderCircle, Mail, Tag, User } from "lucide-react";
import { useTranslations } from "next-intl";
import { ApiError } from "@/services/api/client";
import { FormTextAreaField } from "./FormTextAreaField";
import { FormTextField } from "./FormTextField";
import { useSubmitContactMessage } from "../queries";
import { createContactSchema } from "../schema";
import type { ContactFormValues } from "../types";

const INITIAL_VALUES: ContactFormValues = { name: "", email: "", subject: "", message: "" };

export function ContactForm() {
  const t = useTranslations("contact.form");
  const submitMessage = useSubmitContactMessage();
  const [isSent, setIsSent] = useState(false);

  useEffect(() => {
    if (!isSent) return;
    const timeout = window.setTimeout(() => setIsSent(false), 6000);
    return () => window.clearTimeout(timeout);
  }, [isSent]);

  const schema = useMemo(
    () =>
      createContactSchema({
        required: t("required"),
        invalidName: t("invalidName"),
        invalidEmail: t("invalidEmail"),
      }),
    [t],
  );

  const errorMessage = submitMessage.error
    ? submitMessage.error instanceof ApiError
      ? submitMessage.error.message || t("sendError")
      : t("sendError")
    : null;

  return (
    <div className="rounded-[16px] border border-line bg-surface p-5 shadow-card sm:p-8">
      <h2 className="font-heading text-[20px] font-bold text-ink">{t("title")}</h2>
      {isSent ? (
        <div role="status" className="mt-5 rounded-[12px] border border-success-soft bg-success-soft p-4">
          <p className="text-sm font-bold text-ink">{t("successTitle")}</p>
          <p className="mt-1 text-sm text-body">{t("successText")}</p>
        </div>
      ) : null}
      <Formik
        initialValues={INITIAL_VALUES}
        validationSchema={schema}
        onSubmit={async (values, { resetForm }) => {
          setIsSent(false);
          submitMessage.reset();
          try {
            await submitMessage.mutateAsync(values);
            setIsSent(true);
            resetForm();
          } catch {
            // errorMessage below surfaces the failure; do not clear the form.
          }
        }}
      >
        {({ values, errors, touched, submitCount, handleChange, handleBlur, isSubmitting }) => (
          <Form noValidate className="mt-6 flex flex-col gap-5">
            {errorMessage ? (
              <p role="alert" className="rounded-[12px] bg-danger-soft p-4 text-sm text-danger">
                {errorMessage}
              </p>
            ) : null}

            <FormTextField
              name="name"
              label={t("name")}
              placeholder={t("namePlaceholder")}
              autoComplete="name"
              value={values.name}
              error={(touched.name || submitCount > 0) ? errors.name : undefined}
              icon={User}
              onChange={handleChange}
              onBlur={handleBlur}
            />

            <FormTextField
              name="email"
              label={t("email")}
              placeholder={t("emailPlaceholder")}
              type="email"
              autoComplete="email"
              value={values.email}
              error={(touched.email || submitCount > 0) ? errors.email : undefined}
              icon={Mail}
              onChange={handleChange}
              onBlur={handleBlur}
            />

            <FormTextField
              name="subject"
              label={t("subject")}
              placeholder={t("subjectPlaceholder")}
              value={values.subject}
              error={(touched.subject || submitCount > 0) ? errors.subject : undefined}
              icon={Tag}
              onChange={handleChange}
              onBlur={handleBlur}
            />

            <FormTextAreaField
              name="message"
              label={t("message")}
              placeholder={t("messagePlaceholder")}
              value={values.message}
              error={(touched.message || submitCount > 0) ? errors.message : undefined}
              onChange={handleChange}
              onBlur={handleBlur}
            />

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-brand px-6 text-sm font-bold text-ink shadow-card transition-[translate,background-color] hover:-translate-y-0.5 hover:bg-brand/85 disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none sm:w-auto"
            >
              {isSubmitting ? <LoaderCircle className="size-4 animate-spin" /> : null}
              {isSubmitting ? t("sending") : t("send")}
            </button>
          </Form>
        )}
      </Formik>
    </div>
  );
}
