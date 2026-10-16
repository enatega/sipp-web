"use client";

import { useEffect, useRef, useState } from "react";
import { parsePhoneNumberFromString } from "libphonenumber-js/max";
import { useTranslations } from "next-intl";
import { X } from "lucide-react";
import { createPortal } from "react-dom";
import { CountrySelect } from "@/modules/account/components/auth/CountrySelect";
import { OtpInput } from "@/modules/account/components/auth/OtpInput";
import { countryByIso, defaultCountry } from "@/modules/account/data/countries";
import { formatNationalPhoneInput, phoneExample, validateNationalPhone } from "@/modules/account/utils/phone";
import { profileApi } from "@/modules/account/api/profile";
import { ApiError } from "@/services/api/client";

export function ProfilePhoneVerification({ initialPhone, onClose, onVerified }: { initialPhone?: string | null; onClose: () => void; onVerified: () => Promise<unknown> }) {
  const t = useTranslations("profileInformation");
  const tAuth = useTranslations("auth");
  const parsed = parsePhoneNumberFromString(initialPhone ?? "");
  const [country, setCountry] = useState(() => parsed?.country ? countryByIso(parsed.country) ?? defaultCountry : defaultCountry);
  const [phone, setPhone] = useState(() => parsed?.formatNational() ?? initialPhone ?? "");
  const [sentPhone, setSentPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const attempted = useRef("");
  const dialogRef = useRef<HTMLDivElement>(null);
  const validPhone = validateNationalPhone(phone, country).e164;
  const phoneHasValue = phone.replace(/\D/g, "").length > 0;
  const phoneIsInvalid = phoneHasValue && !validPhone;
  const phoneGuidance = tAuth("phoneFormat", {
    country: country.name,
    example: phoneExample(country) || `+${country.dial}`,
  });

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const frame = window.requestAnimationFrame(() => dialogRef.current?.querySelector<HTMLInputElement>('input[type="tel"]')?.focus());
    return () => {
      window.cancelAnimationFrame(frame);
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !busy && !document.querySelector("[data-country-portal-popup]")) onClose();
      if (event.key !== "Tab") return;
      const focusable = Array.from(dialogRef.current?.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled), [tabindex]:not([tabindex="-1"])') ?? []);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [busy, onClose]);

  useEffect(() => {
    if (sentPhone) dialogRef.current?.querySelector<HTMLInputElement>('input[inputmode="numeric"]')?.focus();
    else if (success) dialogRef.current?.querySelector<HTMLButtonElement>('[data-phone-done]')?.focus();
  }, [sentPhone, success]);
  const messageFor = (reason: unknown, fallback: string) => {
    if (reason instanceof ApiError) {
      if (reason.code === "PHONE_PROTECTED") return t("phoneProtected");
      if (reason.status === 429) return t("phoneRateLimited");
      if (reason.status === 503) return t("phoneSendError");
      if (/expired|already been used/i.test(reason.message)) return t("phoneExpired");
      if (/invalid verification code/i.test(reason.message)) return t("phoneCodeError");
    }
    return reason instanceof Error ? reason.message : fallback;
  };

  async function sendCode() {
    if (!validPhone || busy) return;
    setBusy(true); setError(""); setSuccess(false);
    try {
      await profileApi.sendPhoneVerification({ phone: validPhone });
      setSentPhone(validPhone); setOtp(""); attempted.current = "";
    } catch (reason) { setError(messageFor(reason, t("phoneSendError"))); }
    finally { setBusy(false); }
  }
  async function verifyCode(value: string) {
    if (!sentPhone || !/^\d{4}$/.test(value) || busy) return;
    setBusy(true); setError("");
    try {
      await profileApi.verifyPhoneVerification({ phone: sentPhone, otp: value });
      await onVerified();
      const verified = parsePhoneNumberFromString(sentPhone);
      if (verified?.country) setCountry(countryByIso(verified.country) ?? defaultCountry);
      setPhone("");
      setSentPhone(""); setOtp(""); setSuccess(true);
    } catch (reason) { setError(messageFor(reason, t("phoneCodeError"))); attempted.current = ""; }
    finally { setBusy(false); }
  }

  return createPortal(<div className="fixed inset-0 z-[110] flex items-end justify-center bg-black/60 p-0 backdrop-blur-[2px] sm:items-center sm:p-5" role="dialog" aria-modal="true" aria-labelledby="profile-phone-title" onClick={(event) => { if (event.target === event.currentTarget && !busy) onClose(); }}>
    <div ref={dialogRef} className="max-h-[94svh] w-full max-w-[520px] overflow-y-auto rounded-t-[28px] bg-card px-5 pb-[max(24px,env(safe-area-inset-bottom))] pt-6 shadow-[0_28px_80px_rgba(0,0,0,0.28)] sm:rounded-[28px] sm:p-8">
    <div className="flex items-start justify-between gap-4">
      <div>
        <h2 id="profile-phone-title" className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">{t("phoneChangeTitle")}</h2>
        <p className="mt-2 text-sm leading-6 text-body">{t("phoneChangeDescription")}</p>
      </div>
      <button type="button" onClick={onClose} disabled={busy} aria-label={t("phoneClose")} className="grid size-10 shrink-0 place-items-center rounded-full bg-[var(--soft-surface)] text-body transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-brand disabled:opacity-50"><X aria-hidden="true" className="size-5" /></button>
    </div>
    {sentPhone ? <div className="mt-6">
      <p className="text-sm font-medium">{t("phoneCodeSent", { phone: sentPhone })}</p>
      <OtpInput value={otp} onChange={(value) => { setOtp(value); setError(""); if (value.length < 4) attempted.current = ""; if (/^\d{4}$/.test(value) && attempted.current !== value) { attempted.current = value; void verifyCode(value); } }} disabled={busy} />
      <div className="mt-4 flex flex-wrap gap-3">
        <button type="button" onClick={() => void verifyCode(otp)} disabled={busy || otp.length !== 4} className="min-h-11 rounded-full bg-brand px-5 text-sm font-semibold text-ink disabled:opacity-50">{busy ? t("phoneWorking") : t("phoneVerify")}</button>
        <button type="button" onClick={() => { setSentPhone(""); setOtp(""); setError(""); }} disabled={busy} className="min-h-11 px-3 text-sm font-semibold text-brand">{t("phoneChange")}</button>
      </div>
    </div> : success ? <div className="mt-6"><p role="status" className="text-sm font-medium text-[#137e52]">{t("phoneSuccess")}</p><button data-phone-done type="button" onClick={onClose} className="mt-5 min-h-11 rounded-full bg-brand px-6 text-sm font-semibold text-ink">{t("phoneClose")}</button></div> : <form className="mt-6" onSubmit={(event) => { event.preventDefault(); void sendCode(); }}>
      <label htmlFor="profile-phone-input" className="text-sm font-medium">{t("phoneNumber")}</label>
      <div className={`mt-2 flex min-h-12 items-center rounded-xl border bg-surface focus-within:border-brand ${phoneIsInvalid ? "border-danger" : "border-line"}`}>
        <CountrySelect value={country} onChange={(next) => { setCountry(next); setPhone(formatNationalPhoneInput(phone, next)); setError(""); }} disabled={busy} portalPopup />
        <input id="profile-phone-input" type="tel" inputMode="tel" autoComplete="tel" aria-invalid={phoneIsInvalid} aria-describedby="profile-phone-guidance" value={phone} onChange={(event) => { setPhone(formatNationalPhoneInput(event.target.value, country)); setError(""); }} disabled={busy} className="min-w-0 flex-1 bg-transparent px-4 text-base text-ink outline-none" />
      </div>
      <p id="profile-phone-guidance" aria-live="polite" className={`mt-2 text-xs leading-5 ${phoneIsInvalid ? "text-danger" : "text-body"}`}>{phoneGuidance}</p>
      <button type="submit" disabled={busy || !validPhone} className="mt-4 min-h-11 rounded-full bg-brand px-5 text-sm font-semibold text-ink disabled:opacity-50">{busy ? t("phoneWorking") : t("phoneSend")}</button>
    </form>}
    {error ? <p role="alert" className="mt-4 text-sm text-danger">{error}</p> : null}
    </div>
  </div>, document.body);
}
