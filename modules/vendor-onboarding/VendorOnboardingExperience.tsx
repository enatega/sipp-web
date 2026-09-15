"use client";

import Link from "next/link";
import { Form, Formik } from "formik";
import { useMemo, useState } from "react";
import {
  ArrowDown,
  AtSign,
  Building2,
  KeyRound,
  MapPin,
  Phone,
  ShieldCheck,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Icon } from "@/components/shared/brand/Icon";
import { ApiError } from "@/services/api/client";
import { FileUploadField } from "./FileUploadField";
import { FormTextField } from "./FormTextField";
import { useSubmitVendorApplication, useVendorApplicationOptions } from "./queries";
import { createVendorApplicationSchema } from "./schema";
import type { VendorApplicationResult, VendorApplicationValues } from "./types";
import { ZoneSelectField } from "./ZoneSelectField";

const INITIAL_VALUES: VendorApplicationValues = {
  name: "",
  email: "",
  phone: "",
  city: "",
  zone_id: "",
  password: "",
  confirmPassword: "",
  vendorImage: null,
  business_liscence_front_file: null,
  business_liscence_back_file: null,
  national_id_front_file: null,
  national_id_back_file: null,
};

export function VendorOnboardingExperience() {
  const t = useTranslations("vendorOnboarding");
  const options = useVendorApplicationOptions();
  const submitApplication = useSubmitVendorApplication();
  const [result, setResult] = useState<VendorApplicationResult | null>(null);
  const [submittedEmail, setSubmittedEmail] = useState("");
  const schema = useMemo(
    () =>
      createVendorApplicationSchema({
        required: t("required"),
        invalidName: t("invalidName"),
        invalidEmail: t("invalidEmail"),
        invalidPhone: t("invalidPhone"),
        invalidPassword: t("invalidPassword"),
        passwordMismatch: t("passwordMismatch"),
        invalidFile: t("invalidFile"),
      }),
    [t],
  );

  const errorMessage = (() => {
    const error = submitApplication.error;
    if (!(error instanceof ApiError)) return error ? t("genericError") : null;
    if (error.code === "VENDOR_APPLICATION_PENDING") return t("pendingError");
    if (error.code === "VENDOR_APPLICATION_APPROVED") return t("approvedError");
    if (error.code === "VENDOR_APPLICATION_REJECTED") return t("rejectedError");
    return error.message || t("genericError");
  })();

  if (result) {
    return (
      <main className="min-h-[calc(100vh-76px)] bg-[var(--soft-surface)] py-12 sm:py-20">
        <section className="section-wrap flex justify-center">
          <div className="w-full max-w-[720px] rounded-[16px] bg-surface px-6 py-10 shadow-card sm:px-12 sm:py-14">
            <span className="grid size-16 place-items-center rounded-full bg-success-soft text-success">
              <Icon name="shield" className="size-8" />
            </span>
            <h1 className="mt-7 text-balance text-3xl font-extrabold tracking-[-0.03em] text-ink sm:text-5xl">
              {t("successTitle")}
            </h1>
            <p className="mt-4 max-w-[62ch] text-base leading-7 text-body">
              {result.confirmationEmailSent
                ? t("successText", { email: submittedEmail })
                : t("successTextNoEmail")}
            </p>
            <div className="mt-8 rounded-[14px] bg-danger-soft p-5">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-brand">
                {t("reference")}
              </p>
              <p className="mt-2 break-all font-semibold text-ink">
                {result.applicationId}
              </p>
            </div>
            <h2 className="mt-8 text-xl font-bold text-ink">{t("nextTitle")}</h2>
            <p className="mt-2 text-sm leading-6 text-body">{t("nextText")}</p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/" className="rounded-full bg-brand px-6 py-3 text-sm font-bold text-ink hover:bg-brand/85">
                {t("backHome")}
              </Link>
              <Link href="/help" className="rounded-full border border-line px-6 py-3 text-sm font-bold text-ink hover:border-brand hover:text-brand">
                {t("contactSupport")}
              </Link>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="bg-[var(--soft-surface)]">
      <section className="bg-brand py-14 text-ink sm:py-20 lg:py-24">
        <div className="section-wrap grid items-center gap-12 lg:grid-cols-[1.08fr_0.92fr] lg:gap-20">
          <div>
            <h1 className="max-w-[760px] text-balance text-4xl font-extrabold leading-[1.04] tracking-[-0.035em] sm:text-6xl lg:text-[4.75rem]">
              {t("title")}
            </h1>
            <p className="mt-6 max-w-[62ch] text-base leading-7 text-white/80 sm:text-lg">
              {t("subtitle")}
            </p>
            <a
              href="#vendor-application"
              className="mt-8 inline-flex min-h-12 items-center gap-3 rounded-full border border-brand bg-white px-6 text-sm font-extrabold text-brand transition-[translate,background-color] hover:-translate-y-0.5 hover:bg-black hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
            >
              {t("startApplication")}
              <ArrowDown className="size-4" />
            </a>
          </div>

          <div className="divide-y divide-white/20 border-y border-white/20">
            {([
              ["store", "benefitOne", "benefitOneText"],
              ["shield", "benefitTwo", "benefitTwoText"],
              ["help", "benefitThree", "benefitThreeText"],
            ] as const).map(([icon, title, text]) => (
              <div key={title} className="flex gap-4 py-5 sm:gap-5 sm:py-6">
                <span className="grid size-11 flex-none place-items-center rounded-[12px] bg-white text-brand">
                  <Icon name={icon} className="size-5" />
                </span>
                <div>
                  <h2 className="text-base font-bold text-white">{t(title)}</h2>
                  <p className="mt-1 max-w-[48ch] text-sm leading-6 text-white/75">{t(text)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="vendor-application" className="scroll-mt-24 py-12 sm:py-16 lg:py-20">
        <div className="section-wrap">
          <div className="mx-auto max-w-[760px] text-center">
            <h2 className="text-balance text-3xl font-extrabold tracking-[-0.03em] text-ink sm:text-4xl">
              {t("formTitle")}
            </h2>
            <p className="mx-auto mt-3 max-w-[62ch] text-sm leading-6 text-body sm:text-base">
              {t("formSubtitle")}
            </p>
          </div>

          <div className="mx-auto mt-8 max-w-[980px] rounded-[16px] bg-surface p-5 shadow-card sm:mt-10 sm:p-8 lg:p-12">

          <Formik
            initialValues={INITIAL_VALUES}
            validationSchema={schema}
            onSubmit={async (values) => {
              submitApplication.reset();
              try {
                const response = await submitApplication.mutateAsync(values);
                setSubmittedEmail(values.email);
                setResult(response);
                window.scrollTo({ top: 0, behavior: "smooth" });
              } catch {
                window.scrollTo({ top: 0, behavior: "smooth" });
              }
            }}
          >
            {({ values, errors, touched, submitCount, handleChange, handleBlur, setFieldValue, setFieldTouched, isSubmitting }) => (
              <Form
                noValidate
                onSubmitCapture={() => {
                  window.setTimeout(() => {
                    document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
                  });
                }}
              >
                {errorMessage ? (
                  <div role="alert" className="mb-6 flex gap-3 rounded-[14px] bg-danger-soft p-4 text-sm leading-6 text-danger">
                    <Icon name="info" className="mt-0.5 size-5 flex-none" />
                    <span>{errorMessage}</span>
                  </div>
                ) : null}

                <fieldset>
                  <legend className="flex items-center gap-3 text-xl font-extrabold tracking-[-0.02em] text-ink">
                    <span className="grid size-10 place-items-center rounded-[12px] bg-danger-soft text-brand">
                      <Building2 className="size-5" />
                    </span>
                    {t("businessDetails")}
                  </legend>
                  <p className="mt-3 max-w-[68ch] text-sm leading-6 text-body">{t("businessDetailsHint")}</p>
                  <div className="mt-7 grid gap-x-5 gap-y-6 sm:grid-cols-2">
                    {([
                      ["name", "name", "namePlaceholder", "text", "name", Building2],
                      ["email", "email", "emailPlaceholder", "email", "email", AtSign],
                      ["phone", "phone", "phonePlaceholder", "tel", "tel", Phone],
                      ["city", "city", "cityPlaceholder", "text", "address-level2", MapPin],
                    ] as const).map(([name, label, placeholder, type, autoComplete, FieldIcon]) => {
                      const showError = (touched[name] || submitCount > 0) ? errors[name] : undefined;
                      return (
                        <FormTextField
                          key={name}
                          name={name}
                          label={t(label)}
                          placeholder={t(placeholder)}
                          type={type}
                          autoComplete={autoComplete}
                          value={values[name]}
                          error={showError}
                          icon={FieldIcon}
                          onChange={handleChange}
                          onBlur={handleBlur}
                        />
                      );
                    })}

                    <div className="sm:col-span-2">
                      {options.isError ? (
                        <div>
                          <p className="mb-2 text-[13px] font-bold text-ink">{t("zone")}</p>
                          <div className="flex min-h-14 items-center justify-between gap-4 rounded-[14px] bg-danger-soft px-4 text-sm text-danger">
                          {t("optionsError")}
                          <button type="button" className="font-bold underline underline-offset-4" onClick={() => options.refetch()}>{t("retry")}</button>
                          </div>
                        </div>
                      ) : (
                        <ZoneSelectField
                          label={t("zone")}
                          placeholder={options.isPending ? t("optionsLoading") : t("zonePlaceholder")}
                          value={values.zone_id}
                          options={options.data?.zones ?? []}
                          disabled={options.isPending}
                          error={(touched.zone_id || submitCount > 0) ? errors.zone_id : undefined}
                          onChange={(value) => void setFieldValue("zone_id", value, true)}
                          onBlur={() => void setFieldTouched("zone_id", true, true)}
                        />
                      )}
                    </div>

                    {([
                      ["password", "password", "passwordPlaceholder", "new-password"],
                      ["confirmPassword", "confirmPassword", "confirmPasswordPlaceholder", "new-password"],
                    ] as const).map(([name, label, placeholder, autoComplete]) => {
                      const showError = (touched[name] || submitCount > 0) ? errors[name] : undefined;
                      return (
                        <FormTextField
                          key={name}
                          name={name}
                          label={t(label)}
                          placeholder={t(placeholder)}
                          type="password"
                          autoComplete={autoComplete}
                          value={values[name]}
                          error={showError}
                          icon={KeyRound}
                          showPasswordLabel={t("showPassword")}
                          hidePasswordLabel={t("hidePassword")}
                          onChange={handleChange}
                          onBlur={handleBlur}
                        />
                      );
                    })}
                  </div>
                  <p className="mt-3 text-xs leading-5 text-muted">{t("passwordHint")}</p>
                </fieldset>

                <fieldset className="mt-10 border-t border-line pt-9">
                  <legend className="flex items-center gap-3 pr-4 text-xl font-extrabold tracking-[-0.02em] text-ink">
                    <span className="grid size-10 place-items-center rounded-[12px] bg-success-soft text-success">
                      <ShieldCheck className="size-5" />
                    </span>
                    {t("documents")}
                  </legend>
                  <p className="mt-3 max-w-[68ch] text-sm leading-6 text-body">{t("documentsHint")}</p>
                  <div className="mt-7 grid gap-x-5 gap-y-6 sm:grid-cols-2">
                    {([
                      ["vendorImage", "logo"],
                      ["business_liscence_front_file", "licenseFront"],
                      ["business_liscence_back_file", "licenseBack"],
                      ["national_id_front_file", "idFront"],
                      ["national_id_back_file", "idBack"],
                    ] as const).map(([name, label]) => (
                      <FileUploadField
                        key={name}
                        label={t(label)}
                        value={values[name]}
                        error={(touched[name] || submitCount > 0) ? (errors[name] as string | undefined) : undefined}
                        chooseLabel={t("chooseFile")}
                        replaceLabel={t("replaceFile")}
                        dropLabel={t("dropFile")}
                        fileHint={t("fileHint")}
                        removeLabel={t("removeFile")}
                        previewAlt={t("previewAlt", { document: t(label) })}
                        onChange={(file) => {
                          void setFieldValue(name, file, true);
                        }}
                      />
                    ))}
                  </div>
                </fieldset>

                <div className="mt-10 flex flex-col gap-5 border-t border-line pt-7 sm:flex-row sm:items-center sm:justify-between">
                  <p className="flex max-w-[62ch] gap-2 text-xs leading-5 text-muted">
                    <ShieldCheck className="mt-0.5 size-4 flex-none text-success" />
                    {t("privacy")}
                  </p>
                  <button
                    type="submit"
                    disabled={isSubmitting || options.isPending || options.isError}
                    className="inline-flex min-h-12 w-full flex-none items-center justify-center gap-2 rounded-full bg-brand px-7 text-sm font-bold text-ink shadow-card transition-[translate,background-color] hover:-translate-y-0.5 hover:bg-brand/85 disabled:cursor-not-allowed disabled:opacity-55 disabled:shadow-none sm:w-auto"
                  >
                    {isSubmitting ? t("submitting") : t("submit")}
                    {!isSubmitting ? <ArrowDown className="size-4 -rotate-90" /> : null}
                  </button>
                </div>
              </Form>
            )}
          </Formik>
          </div>
        </div>
      </section>
    </main>
  );
}
