"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { parsePhoneNumberFromString } from "libphonenumber-js/max";
import { useTranslations } from "next-intl";
import { ArrowLeft, Phone, ShieldCheck } from "lucide-react";
import { Header } from "@/components/shared/app-shell/Header";
import { CountrySelect } from "@/modules/account/components/auth/CountrySelect";
import { OtpInput } from "@/modules/account/components/auth/OtpInput";
import { countryByIso, defaultCountry } from "@/modules/account/data/countries";
import { formatNationalPhoneInput, validateNationalPhone } from "@/modules/account/utils/phone";
import { profileApi } from "@/modules/account/api/profile";

export function CheckoutPhoneVerification({ initialPhone, onVerified }: { initialPhone?: string | null; onVerified: () => Promise<unknown> }) {
  const t = useTranslations("deliveries.checkout");
  const parsed = parsePhoneNumberFromString(initialPhone ?? "");
  const [country, setCountry] = useState(() => parsed?.country ? countryByIso(parsed.country) ?? defaultCountry : defaultCountry);
  const [phone, setPhone] = useState(() => parsed?.formatNational() ?? "");
  const [sentPhone, setSentPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const attemptedOtp = useRef("");
  const validPhone = validateNationalPhone(phone, country).e164;

  async function sendCode() {
    if (!validPhone || busy) return;
    setBusy(true);
    setError("");
    try {
      await profileApi.sendPhoneVerification({ phone: validPhone });
      setSentPhone(validPhone);
      setOtp("");
      attemptedOtp.current = "";
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : t("phoneVerificationSendError"));
    } finally {
      setBusy(false);
    }
  }

  async function verifyCode(code: string) {
    if (!/^\d{4}$/.test(code) || busy || !sentPhone) return;
    setBusy(true);
    setError("");
    try {
      await profileApi.verifyPhoneVerification({ phone: sentPhone, otp: code });
      await onVerified();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : t("phoneVerificationCodeError"));
    } finally {
      setBusy(false);
    }
  }

  return <>
    <Header />
    <main className="section-wrap min-h-[70svh] py-8 sm:py-14">
      <Link href="/cart" className="inline-flex items-center gap-2 text-sm font-semibold text-body hover:text-brand"><ArrowLeft className="size-4" aria-hidden="true" />{t("backToCart")}</Link>
      <section className="mx-auto mt-10 max-w-lg rounded-2xl bg-card p-6 shadow-card sm:p-9" aria-labelledby="checkout-phone-title">
        <span className="grid size-12 place-items-center rounded-xl bg-brand/10 text-brand"><ShieldCheck className="size-6" aria-hidden="true" /></span>
        <h1 id="checkout-phone-title" className="mt-5 text-2xl font-bold tracking-tight text-ink">{t("phoneVerificationTitle")}</h1>
        <p className="mt-2 text-sm leading-6 text-body">{t("phoneVerificationDescription")}</p>
        {sentPhone ? <div className="mt-7">
          <p className="text-sm font-semibold text-ink">{t("phoneVerificationSentTo", { phone: sentPhone })}</p>
          <OtpInput value={otp} onChange={(value) => {
            setOtp(value);
            setError("");
            if (value.length < 4) attemptedOtp.current = "";
            if (/^\d{4}$/.test(value) && attemptedOtp.current !== value) {
              attemptedOtp.current = value;
              void verifyCode(value);
            }
          }} disabled={busy} />
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button type="button" disabled={busy || otp.length !== 4} onClick={() => void verifyCode(otp)} className="min-h-11 rounded-full bg-brand px-6 text-sm font-bold text-ink disabled:opacity-50">{busy ? t("phoneVerificationWorking") : t("phoneVerificationConfirm")}</button>
            <button type="button" disabled={busy} onClick={() => { setSentPhone(""); setOtp(""); setError(""); }} className="min-h-11 px-3 text-sm font-semibold text-brand">{t("phoneVerificationChange")}</button>
          </div>
        </div> : <form className="mt-7" onSubmit={(event) => { event.preventDefault(); void sendCode(); }}>
          <label htmlFor="checkout-phone-number" className="text-sm font-semibold text-ink">{t("phoneVerificationNumber")}</label>
          <div className="mt-2 flex min-h-12 items-center rounded-xl border border-line bg-surface focus-within:border-brand">
            <CountrySelect value={country} onChange={(next) => { setCountry(next); setPhone(formatNationalPhoneInput(phone, next)); setError(""); }} disabled={busy} />
            <input id="checkout-phone-number" type="tel" inputMode="tel" autoComplete="tel" value={phone} onChange={(event) => { setPhone(formatNationalPhoneInput(event.target.value, country)); setError(""); }} disabled={busy} className="min-w-0 flex-1 bg-transparent px-4 text-base text-ink outline-none" />
          </div>
          <button type="submit" disabled={busy || !validPhone} className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-full bg-brand px-6 text-sm font-bold text-ink disabled:opacity-50"><Phone className="size-4" aria-hidden="true" />{busy ? t("phoneVerificationWorking") : t("phoneVerificationSend")}</button>
        </form>}
        {error ? <p role="alert" className="mt-4 text-sm font-medium text-danger">{error}</p> : null}
      </section>
    </main>
  </>;
}
