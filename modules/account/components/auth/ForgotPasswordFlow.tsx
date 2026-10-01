"use client";

import { useEffect, useRef, useState } from "react";
import { useFormik } from "formik";
import { Check, Eye, EyeOff } from "lucide-react";
import { useTranslations } from "next-intl";
import * as yup from "yup";
import { OtpInput } from "@/modules/account/components/auth/OtpInput";
import {
  errorNote,
  fieldInput,
  fieldLabel,
  fieldShell,
  footNote,
  formHeading,
  formShell,
  formSubtitle,
  formTitle,
  inlineAction,
  submitButton,
} from "@/modules/account/components/auth/styles";
import {
  useResetForgottenPasswordMutation,
  useSendForgotPasswordOtpMutation,
  useVerifyForgotPasswordOtpMutation,
} from "@/modules/account/queries/useAccountQueries";

type Stage = "email" | "otp" | "password" | "done";

const passwordRules = [
  { key: "length", test: (value: string) => value.length >= 8 },
  { key: "upperLower", test: (value: string) => /[a-z]/.test(value) && /[A-Z]/.test(value) },
  { key: "numberSymbol", test: (value: string) => /\d/.test(value) && /[^A-Za-z0-9]/.test(value) },
] as const;

export function ForgotPasswordFlow({
  initialEmail = "",
  onReturnToLogin,
}: {
  initialEmail?: string;
  onReturnToLogin: () => void;
}) {
  const t = useTranslations("auth");
  const common = useTranslations("common");
  const sendOtp = useSendForgotPasswordOtpMutation();
  const verifyOtp = useVerifyForgotPasswordOtpMutation();
  const resetPassword = useResetForgottenPasswordMutation();
  const normalizedInitialEmail = initialEmail.trim().toLowerCase();
  const [stage, setStage] = useState<Stage>(normalizedInitialEmail ? "otp" : "email");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const automaticSendStarted = useRef(false);
  const busy = sendOtp.isPending || verifyOtp.isPending || resetPassword.isPending;

  const formik = useFormik({
    initialValues: { email: normalizedInitialEmail, otp: "", password: "", confirmPassword: "" },
    onSubmit: async (values) => {
      setError("");
      try {
        if (stage === "email") {
          const email = await yup.string().trim().lowercase().email(t("invalidEmail")).required(t("invalidEmail")).validate(values.email);
          await sendOtp.mutateAsync({ email });
          await formik.setFieldValue("email", email, false);
          setStage("otp");
          return;
        }
        if (stage === "otp") {
          const otp = await yup.string().matches(/^\d{4}$/, t("forgotInvalidOtp")).required(t("forgotInvalidOtp")).validate(values.otp);
          await verifyOtp.mutateAsync({ email: values.email, otp });
          setStage("password");
          return;
        }
        const strong = passwordRules.every((rule) => rule.test(values.password));
        if (!strong || values.password.length > 128) throw new Error(t("strongPasswordError"));
        if (values.password !== values.confirmPassword) throw new Error(t("passwordsMismatch"));
        await resetPassword.mutateAsync({ password: values.password });
        setStage("done");
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : common("genericError"));
      }
    },
  });

  useEffect(() => {
    if (!normalizedInitialEmail || automaticSendStarted.current) return;
    automaticSendStarted.current = true;
    void sendOtp.mutateAsync({ email: normalizedInitialEmail }).catch((caught) => {
      setError(caught instanceof Error ? caught.message : common("genericError"));
    });
  }, [common, normalizedInitialEmail, sendOtp]);

  const resend = async () => {
    if (busy) return;
    setError("");
    try {
      await sendOtp.mutateAsync({ email: formik.values.email });
      await formik.setFieldValue("otp", "", false);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : common("genericError"));
    }
  };

  if (stage === "done") {
    return (
      <div className={`${formShell} text-center`} role="status">
        <span className="mx-auto grid size-14 place-items-center rounded-full bg-success-soft text-success">
          <Check className="size-7" aria-hidden="true" />
        </span>
        <header className={formHeading}>
          <h2 className={formTitle}>{t("passwordResetDone")}</h2>
          <p className={formSubtitle}>{t("passwordResetDoneDescription")}</p>
        </header>
        <button className={submitButton} type="button" onClick={onReturnToLogin}>{t("backToLogin")}</button>
      </div>
    );
  }

  return (
    <form className={formShell} onSubmit={formik.handleSubmit} noValidate>
      <header className={formHeading}>
        <h2 className={formTitle}>
          {stage === "email" ? t("forgotPasswordTitle") : stage === "otp" ? t("forgotOtpTitle") : t("createNewPasswordTitle")}
        </h2>
        <p className={formSubtitle}>
          {stage === "email" ? t("forgotPasswordDescription") : stage === "otp" ? t("forgotOtpDescription", { email: formik.values.email }) : t("createNewPasswordDescription")}
        </p>
      </header>

      {stage === "email" ? (
        <label className={fieldShell}>
          <span className={fieldLabel}>{t("email")}</span>
          <input className={fieldInput} name="email" value={formik.values.email} onChange={formik.handleChange} type="email" autoComplete="email" placeholder={t("emailPlaceholder")} disabled={busy} autoFocus />
        </label>
      ) : null}

      {stage === "otp" ? (
        <>
          <OtpInput length={4} value={formik.values.otp} onChange={(value) => void formik.setFieldValue("otp", value, false)} disabled={busy} />
          <div className="flex items-center justify-between gap-4 text-[12px]">
            <button className={inlineAction} type="button" onClick={() => setStage("email")} disabled={busy}>{t("changeEmail")}</button>
            <button className={inlineAction} type="button" onClick={() => void resend()} disabled={busy}>{t("resendCode")}</button>
          </div>
        </>
      ) : null}

      {stage === "password" ? (
        <>
          <label className={fieldShell}>
            <span className={fieldLabel}>{t("newPassword")}</span>
            <span className="relative flex items-center">
              <input className={`${fieldInput} pr-12`} name="password" value={formik.values.password} onChange={formik.handleChange} type={showPassword ? "text" : "password"} autoComplete="new-password" disabled={busy} autoFocus />
              <button type="button" className="absolute right-4 text-muted hover:text-foreground" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? t("hidePassword") : t("showPassword")}>
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </span>
          </label>
          <label className={fieldShell}>
            <span className={fieldLabel}>{t("confirmPassword")}</span>
            <span className="relative flex items-center">
              <input className={`${fieldInput} pe-12`} name="confirmPassword" value={formik.values.confirmPassword} onChange={formik.handleChange} type={showConfirmPassword ? "text" : "password"} autoComplete="new-password" disabled={busy} />
              <button type="button" className="absolute end-3 rounded p-1 text-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-brand" onClick={() => setShowConfirmPassword((value) => !value)} aria-label={showConfirmPassword ? t("hidePassword") : t("showPassword")} aria-pressed={showConfirmPassword}>
                {showConfirmPassword ? <EyeOff className="size-4" aria-hidden="true" /> : <Eye className="size-4" aria-hidden="true" />}
              </button>
            </span>
          </label>
          <ul className="grid gap-1 text-[11px] text-muted" aria-label={t("passwordRequirements")}>
            {passwordRules.map((rule) => {
              const met = rule.test(formik.values.password);
              return <li key={rule.key} className={`flex items-center gap-2 ${met ? "text-success" : ""}`}><Check className="size-3.5" aria-hidden="true" />{t(`passwordRule${rule.key === "length" ? "Length" : rule.key === "upperLower" ? "Case" : "Number"}`)}</li>;
            })}
          </ul>
        </>
      ) : null}

      {error ? <p className={errorNote} role="alert">{error}</p> : null}
      <button className={submitButton} disabled={busy} type="submit">
        {busy ? t("pleaseWait") : stage === "email" ? t("sendResetCode") : stage === "otp" ? t("verify") : t("setNewPassword")}
      </button>
      {stage === "email" ? <button className={`${inlineAction} self-center`} type="button" onClick={onReturnToLogin}>{t("backToLogin")}</button> : null}
      {stage === "otp" ? <p className={footNote}>{t("forgotOtpHelp")}</p> : null}
    </form>
  );
}
