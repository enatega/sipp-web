"use client";

import { useEffect, useState } from "react";
import { useFormik } from "formik";
import { AlertTriangle, Check, Eye, EyeOff, KeyRound, LoaderCircle, Mail, ShieldCheck, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ProfileSidebar } from "@/modules/account/components/profile/ProfileSidebar";
import { ProfileBackLink } from "@/modules/account/components/profile/ProfileBackLink";
import { OtpInput } from "@/modules/account/components/auth/OtpInput";
import { fieldInput, fieldLabel } from "@/modules/account/components/auth/styles";
import {
  useDeleteAccountMutation,
  useSendPasswordChangeOtpMutation,
  useSessionQuery,
  useUpdatePasswordMutation,
  useVerifyPasswordChangeOtpMutation,
} from "@/modules/account/queries/useAccountQueries";
import type { DeletionReason } from "@/modules/account/api/security";

type PasswordStage = "idle" | "otp" | "new";
const passwordChecks = [
  (value: string) => value.length >= 8,
  (value: string) => /[a-z]/.test(value) && /[A-Z]/.test(value),
  (value: string) => /\d/.test(value) && /[^A-Za-z0-9]/.test(value),
] as const;
const reasonCodes: DeletionReason[] = ["no_longer_needed", "cannot_find_stores", "privacy_concerns", "poor_experience", "other"];

export function AccountSecurity() {
  const t = useTranslations("accountSecurity");
  const router = useRouter();
  const session = useSessionQuery();
  const sendOtp = useSendPasswordChangeOtpMutation();
  const verifyOtp = useVerifyPasswordChangeOtpMutation();
  const updatePassword = useUpdatePasswordMutation();
  const deleteAccount = useDeleteAccountMutation();
  const authenticated = session.data?.authenticated === true;
  const email = session.data?.authenticated ? session.data.user?.email?.trim().toLowerCase() ?? "" : "";
  const [passwordStage, setPasswordStage] = useState<PasswordStage>("idle");
  const [passwordError, setPasswordError] = useState("");
  const [resendIn, setResendIn] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    if (!session.isPending && !authenticated) router.replace("/login");
  }, [authenticated, router, session.isPending]);

  useEffect(() => {
    if (resendIn <= 0) return;
    const timer = window.setTimeout(() => setResendIn((value) => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [resendIn]);

  const passwordForm = useFormik({
    initialValues: { otp: "", password: "", confirmPassword: "" },
    onSubmit: async (values) => {
      setPasswordError("");
      try {
        if (passwordStage === "otp") {
          if (!/^\d{4}$/.test(values.otp)) throw new Error(t("invalidOtp"));
          await verifyOtp.mutateAsync(values.otp);
          setPasswordStage("new");
          return;
        }
        if (passwordStage === "new") {
          if (!passwordChecks.every((check) => check(values.password)) || values.password.length > 128) throw new Error(t("strongPasswordError"));
          if (values.password !== values.confirmPassword) throw new Error(t("passwordMismatch"));
          await updatePassword.mutateAsync({ otp: values.otp, newPassword: values.password });
          router.replace("/login");
          router.refresh();
        }
      } catch (caught) {
        setPasswordError(caught instanceof Error ? caught.message : t("genericError"));
      }
    },
  });

  const requestPasswordOtp = async () => {
    setPasswordError("");
    try {
      await sendOtp.mutateAsync();
      await passwordForm.setFieldValue("otp", "", false);
      setPasswordStage("otp");
      setResendIn(30);
    } catch (caught) {
      setPasswordError(caught instanceof Error ? caught.message : t("genericError"));
    }
  };

  const deleteForm = useFormik({
    initialValues: { reason: "" as DeletionReason | "", understandOrders: false, understandAccess: false, confirmationEmail: "" },
    onSubmit: async (values) => {
      if (!values.reason || !values.understandOrders || !values.understandAccess || values.confirmationEmail.trim().toLowerCase() !== email) return;
      try {
        await deleteAccount.mutateAsync({ reason: values.reason, confirmationEmail: values.confirmationEmail });
        router.replace("/");
        router.refresh();
      } catch (caught) {
        deleteForm.setStatus(caught instanceof Error ? caught.message : t("genericError"));
      }
    },
  });

  const passwordBusy = sendOtp.isPending || verifyOtp.isPending || updatePassword.isPending;
  const canDelete = Boolean(deleteForm.values.reason) && deleteForm.values.understandOrders && deleteForm.values.understandAccess && deleteForm.values.confirmationEmail.trim().toLowerCase() === email;

  return (
    <main className="min-h-[calc(100svh-4rem)] bg-background text-foreground md:min-h-[calc(100svh-4.75rem)] min-[700px]:grid min-[700px]:grid-cols-[240px_1fr]">
      <ProfileSidebar />
      <div className="min-w-0">
        <div className="mx-auto w-full max-w-[1040px] px-5 py-7 sm:px-8 sm:py-10">
          <header className="mb-8 max-w-[68ch]">
            <ProfileBackLink />
            <div className="mb-4 grid size-11 place-items-center rounded-xl bg-danger-soft text-brand"><ShieldCheck className="size-5" aria-hidden="true" /></div>
            <h1 className="text-[27px] font-semibold tracking-[-0.025em] sm:text-[32px]">{t("title")}</h1>
            <p className="mt-2 text-[13px] leading-relaxed text-body">{t("subtitle")}</p>
          </header>

          {session.isPending ? (
            <div className="grid min-h-64 place-items-center" role="status"><span className="flex items-center gap-3 text-sm text-muted"><LoaderCircle className="size-5 animate-spin text-brand" />{t("loading")}</span></div>
          ) : authenticated ? (
            <div className="grid gap-6">
              <section className="rounded-2xl bg-card p-5 shadow-card sm:p-7" aria-labelledby="change-password-title">
                <div className="flex items-start gap-4">
                  <span className="grid size-11 flex-none place-items-center rounded-xl bg-[var(--soft-surface)] text-brand"><KeyRound className="size-5" /></span>
                  <div className="min-w-0 flex-1">
                    <h2 id="change-password-title" className="text-[18px] font-semibold">{t("changePasswordTitle")}</h2>
                    <p className="mt-1 max-w-[65ch] text-[12px] leading-relaxed text-body">{t("changePasswordDescription")}</p>
                  </div>
                </div>

                {passwordStage === "idle" ? (
                  <div className="mt-6 flex flex-col gap-4 rounded-xl bg-[var(--soft-surface)] p-4 sm:flex-row sm:items-center sm:justify-between">
                    <span className="flex min-w-0 items-center gap-3 text-[12px]"><Mail className="size-4 flex-none text-muted" /><span className="truncate">{email || t("emailMissing")}</span></span>
                    <button type="button" onClick={() => void requestPasswordOtp()} disabled={passwordBusy || !email} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-brand px-5 text-[12px] font-semibold text-ink hover:bg-brand/85 disabled:cursor-not-allowed disabled:opacity-55">
                      {sendOtp.isPending ? <LoaderCircle className="size-4 animate-spin" /> : null}{sendOtp.isPending ? t("sending") : t("sendCode")}
                    </button>
                  </div>
                ) : (
                  <form onSubmit={passwordForm.handleSubmit} className="mt-6 max-w-[560px] space-y-4" noValidate>
                    {passwordStage === "otp" ? (
                      <>
                        <p className="text-[12px] text-body">{t("codeSent", { email })}</p>
                        <OtpInput length={4} value={passwordForm.values.otp} onChange={(value) => void passwordForm.setFieldValue("otp", value, false)} disabled={passwordBusy} />
                        <div className="flex items-center justify-between gap-4 text-[11px]">
                          <button type="button" onClick={() => setPasswordStage("idle")} className="font-semibold text-muted hover:text-foreground">{t("cancel")}</button>
                          <button type="button" disabled={resendIn > 0 || passwordBusy} onClick={() => void requestPasswordOtp()} className="font-semibold text-brand disabled:text-muted">{resendIn > 0 ? t("resendIn", { seconds: resendIn }) : t("resend")}</button>
                        </div>
                      </>
                    ) : (
                      <>
                        <label className="block"><span className={fieldLabel}>{t("newPassword")}</span><span className="relative mt-2 flex items-center"><input className={`${fieldInput} pr-12`} name="password" value={passwordForm.values.password} onChange={passwordForm.handleChange} type={showPassword ? "text" : "password"} autoComplete="new-password" autoFocus /><button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-4 text-muted hover:text-foreground" aria-label={showPassword ? t("hidePassword") : t("showPassword")}>{showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</button></span></label>
                        <label className="block"><span className={fieldLabel}>{t("confirmPassword")}</span><input className={`${fieldInput} mt-2`} name="confirmPassword" value={passwordForm.values.confirmPassword} onChange={passwordForm.handleChange} type="password" autoComplete="new-password" /></label>
                        <ul className="grid gap-1.5 text-[11px] text-muted" aria-label={t("requirements")}>
                          {["ruleLength", "ruleCase", "ruleNumber"].map((key, index) => <li key={key} className={`flex items-center gap-2 ${passwordChecks[index](passwordForm.values.password) ? "text-success" : ""}`}><Check className="size-3.5" />{t(key)}</li>)}
                        </ul>
                      </>
                    )}
                    {passwordError ? <p role="alert" className="rounded-lg bg-danger-soft px-4 py-3 text-[12px] text-danger">{passwordError}</p> : null}
                    <button type="submit" disabled={passwordBusy} className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-brand px-5 text-[12px] font-semibold text-ink hover:bg-brand/85 disabled:cursor-wait disabled:opacity-60">{passwordBusy ? <LoaderCircle className="size-4 animate-spin" /> : null}{passwordStage === "otp" ? t("verifyCode") : t("savePassword")}</button>
                  </form>
                )}
                {passwordStage === "idle" && passwordError ? <p role="alert" className="mt-4 rounded-lg bg-danger-soft px-4 py-3 text-[12px] text-danger">{passwordError}</p> : null}
              </section>

              <section className="rounded-2xl bg-card p-5 shadow-card sm:p-7" aria-labelledby="delete-account-title">
                <div className="flex items-start gap-4">
                  <span className="grid size-11 flex-none place-items-center rounded-xl bg-danger-soft text-danger"><Trash2 className="size-5" /></span>
                  <div className="min-w-0 flex-1"><h2 id="delete-account-title" className="text-[18px] font-semibold">{t("deleteTitle")}</h2><p className="mt-1 max-w-[65ch] text-[12px] leading-relaxed text-body">{t("deleteDescription")}</p></div>
                </div>
                {!deleteOpen ? (
                  <button type="button" onClick={() => setDeleteOpen(true)} className="mt-6 inline-flex min-h-10 items-center justify-center rounded-lg border border-danger px-5 text-[12px] font-semibold text-danger hover:bg-danger-soft">{t("startDelete")}</button>
                ) : (
                  <form className="mt-6 max-w-[650px] space-y-5" onSubmit={deleteForm.handleSubmit} noValidate>
                    <div className="flex gap-3 rounded-xl bg-danger-soft p-4 text-danger"><AlertTriangle className="mt-0.5 size-5 flex-none" /><p className="text-[12px] leading-relaxed">{t("deleteWarning")}</p></div>
                    <fieldset><legend className={`${fieldLabel} mb-2`}>{t("reasonLabel")}</legend><div className="grid gap-2">{reasonCodes.map((reason) => <label key={reason} className="flex cursor-pointer items-center gap-3 rounded-xl border border-line px-4 py-3 text-[12px] hover:bg-[var(--soft-surface)]"><input type="radio" name="reason" value={reason} checked={deleteForm.values.reason === reason} onChange={deleteForm.handleChange} className="size-4 accent-[var(--color-brand)]" />{t(`reason_${reason}`)}</label>)}</div></fieldset>
                    <div className="grid gap-2">{(["understandOrders", "understandAccess"] as const).map((name) => <label key={name} className="flex cursor-pointer items-start gap-3 text-[12px] leading-relaxed text-body"><input type="checkbox" name={name} checked={deleteForm.values[name]} onChange={deleteForm.handleChange} className="mt-0.5 size-4 accent-[var(--color-brand)]" />{t(name)}</label>)}</div>
                    <label className="block"><span className={fieldLabel}>{t("confirmEmailLabel")}</span><p className="mt-1 text-[11px] text-muted">{t("confirmEmailHelp", { email })}</p><input className={`${fieldInput} mt-2`} name="confirmationEmail" value={deleteForm.values.confirmationEmail} onChange={deleteForm.handleChange} type="email" autoComplete="off" spellCheck={false} /></label>
                    {deleteForm.status ? <p role="alert" className="rounded-lg bg-danger-soft px-4 py-3 text-[12px] text-danger">{deleteForm.status}</p> : null}
                    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><button type="button" onClick={() => { setDeleteOpen(false); deleteForm.resetForm(); }} className="min-h-11 rounded-lg px-5 text-[12px] font-semibold text-foreground hover:bg-[var(--soft-surface)]">{t("cancel")}</button><button type="submit" disabled={!canDelete || deleteAccount.isPending} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-danger px-5 text-[12px] font-semibold text-white hover:bg-secondary/85 disabled:cursor-not-allowed disabled:opacity-45">{deleteAccount.isPending ? <LoaderCircle className="size-4 animate-spin" /> : null}{t("deleteForever")}</button></div>
                  </form>
                )}
              </section>
            </div>
          ) : null}
        </div>
      </div>
    </main>
  );
}
