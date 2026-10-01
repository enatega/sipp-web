"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useFormik } from "formik";
import { LoaderCircle } from "lucide-react";
import { parsePhoneNumberFromString } from "libphonenumber-js/max";
import { ValidationError } from "yup";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { AuthBrand } from "@/modules/account/components/auth/AuthBrand";
import { CountrySelect } from "@/modules/account/components/auth/CountrySelect";
import { OtpInput } from "@/modules/account/components/auth/OtpInput";
import { PasswordInput } from "@/modules/account/components/auth/PasswordInput";
import { ForgotPasswordFlow } from "@/modules/account/components/auth/ForgotPasswordFlow";
import { SocialAuthButtons } from "@/modules/account/components/auth/SocialAuthButtons";
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
import { AuthApiError } from "@/modules/account/api/auth";
import { setIntentionalLogout } from "@/services/api/client";
import { countryByIso, defaultCountry } from "@/modules/account/data/countries";
import {
  formatNationalPhoneInput,
  phoneExample,
  validateNationalPhone,
} from "@/modules/account/utils/phone";
import {
  useEmailExistsMutation,
  useCountryRegionQuery,
  useLoginMutation,
  useSendPhoneOtpMutation,
  useSendSignupOtpMutation,
  useVerifyPhoneOtpMutation,
  useVerifySignupOtpMutation,
} from "@/modules/account/queries/useAccountQueries";
import { createAuthSchemas } from "@/modules/account/schemas/authSchema";
import { safeReturnTo } from "@/modules/account/utils/authRedirect";
import { toast } from "sonner";

type View = "login" | "password" | "phone" | "signup" | "otp" | "forgot";
type OtpPurpose = "phone-login" | "signup";

/**
 * The login endpoints answer an unknown identifier with 404 ("User with this
 * phone number does not exist"), which sends the visitor to sign-up carrying
 * whatever they already typed. The message check is only a fallback for a
 * proxy that loses the status.
 */
function isUnknownAccount(caught: unknown) {
  if (caught instanceof AuthApiError) return caught.status === 404;
  const message = caught instanceof Error ? caught.message : "";
  return /does\s*n[o']?t\s*exist|not\s*found|no\s*(such\s*)?(account|user)/i.test(
    message,
  );
}

export function AuthExperience({ returnTo }: { returnTo?: string }) {
  const router = useRouter();
  const t = useTranslations("auth");
  const common = useTranslations("common");
  const emailExists = useEmailExistsMutation();
  const countryRegion = useCountryRegionQuery();
  const login = useLoginMutation();
  const sendPhoneOtp = useSendPhoneOtpMutation();
  const sendSignupOtp = useSendSignupOtpMutation();
  const verifyPhoneOtp = useVerifyPhoneOtpMutation();
  const verifySignupOtp = useVerifySignupOtpMutation();
  const schemas = createAuthSchemas({
    email: t("invalidEmail"),
    phone: t("invalidPhone"),
    name: t("invalidName"),
    password: t("invalidPassword"),
    signupPassword: t("signupInvalidPassword"),
    passwordsMatch: t("passwordsMismatch"),
    otp: t("invalidOtp"),
  });
  const [view, setView] = useState<View>("login");
  const [otpPurpose, setOtpPurpose] = useState<OtpPurpose>("phone-login");
  /**
   * The identifier we already resolved as having no account. It arrives on
   * the sign-up form pre-filled and locked: editing it there would silently
   * detach the form from the lookup that sent the visitor here.
   */
  const [lockedField, setLockedField] = useState<"email" | "phone" | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendIn, setResendIn] = useState(30);
  const manuallySelectedCountry = useRef(false);
  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
      country: defaultCountry,
      phone: "",
      name: "",
      signupPassword: "",
      confirmPassword: "",
      otp: "",
    },
    onSubmit: async () => {
      if (view === "login") return submitEmail();
      if (view === "password") return submitPassword();
      if (view === "phone") return submitPhone();
      if (view === "signup") return submitSignup();
      if (view === "otp") return verifyOtp();
    },
  });
  const {
    email,
    password,
    country,
    phone,
    name,
    signupPassword,
    confirmPassword,
    otp,
  } = formik.values;
  const phoneValidation = useMemo(
    () => validateNationalPhone(phone, country),
    [country, phone],
  );
  const selectedPhoneExample = useMemo(() => phoneExample(country), [country]);
  const phoneGuidance = t("phoneFormat", {
    country: country.name,
    example: selectedPhoneExample || `+${country.dial}`,
  });
  const detectedCountry = countryRegion.data?.country
    ? countryByIso(countryRegion.data.country)
    : null;
  const countryLookupPending = !manuallySelectedCountry.current && !phone.trim() && (
    countryRegion.isPending || Boolean(detectedCountry && country.iso !== detectedCountry.iso)
  );

  useEffect(() => {
    if (manuallySelectedCountry.current || phone.trim() || !countryRegion.data?.country) return;
    const resolvedCountry = countryByIso(countryRegion.data.country);
    if (resolvedCountry) void formik.setFieldValue("country", resolvedCountry, false);
  }, [countryRegion.data?.country, phone]);

  function validatedPhone() {
    if (!phoneValidation.e164) throw new Error(phoneGuidance);
    return phoneValidation.e164;
  }

  function changeCountry(nextCountry: typeof country) {
    manuallySelectedCountry.current = true;
    void formik.setFieldValue("country", nextCountry, false);
    void formik.setFieldValue(
      "phone",
      formatNationalPhoneInput(phone, nextCountry),
      false,
    );
    setError("");
  }

  function changePhone(value: string) {
    if (value.trim().startsWith("+")) {
      const parsed = parsePhoneNumberFromString(value);
      const detectedCountry = parsed?.country ? countryByIso(parsed.country) : null;
      if (detectedCountry) {
        manuallySelectedCountry.current = true;
        void formik.setFieldValue("country", detectedCountry, false);
        void formik.setFieldValue("phone", parsed!.formatNational(), false);
        void formik.setFieldError("phone", undefined);
        setError("");
        return;
      }
      void formik.setFieldValue("phone", value.slice(0, 22), false);
      void formik.setFieldError("phone", undefined);
      setError("");
      return;
    }
    void formik.setFieldValue(
      "phone",
      formatNationalPhoneInput(value, country),
      false,
    );
    void formik.setFieldError("phone", undefined);
    setError("");
  }

  const phoneHasValue = phone.replace(/\D/g, "").length > 0;
  const phoneIsInvalid = phoneHasValue && !phoneValidation.isValid;

  useEffect(() => {
    if (view !== "otp" || resendIn <= 0) return;
    const timer = window.setTimeout(() => setResendIn((value) => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [resendIn, view]);

  const goTo = (next: View) => {
    setError("");
    formik.setErrors({});
    void formik.setFieldValue("otp", "", false);
    if (next !== "otp") setLockedField(null);
    setView(next);
  };

  const finishAuth = () => {
    formik.resetForm();
    setIntentionalLogout(false);
    window.dispatchEvent(new Event("shaaneiol-auth-change"));
    toast.success(t("loginSuccess"));
    router.replace(safeReturnTo(returnTo));
    router.refresh();
  };

  const run = async (task: () => Promise<void>) => {
    setError("");
    setLoading(true);
    try {
      await task();
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : common("genericError"),
      );
    } finally {
      setLoading(false);
    }
  };

  /**
   * Email step: resolve whether the account exists before asking for
   * anything else, so a known email goes to the password screen and an
   * unknown one lands on sign-up with the email already filled in.
   */
  const submitEmail = () =>
    run(async () => {
      const value = email.trim().toLowerCase();
      await schemas.email.validate(value);

      await formik.setFieldValue("email", value, false);
      const { exists } = await emailExists.mutateAsync({ email: value });
      setLockedField(exists ? null : "email");
      setView(exists ? "password" : "signup");
    });

  const submitPassword = () =>
    run(async () => {
      await schemas.password.validate(password);

      try {
        await login.mutateAsync({ email: email.trim().toLowerCase(), password });
      } catch (caught) {
        if (isUnknownAccount(caught)) {
          await formik.setFieldValue("signupPassword", password, false);
          setLockedField("email");
          setError("");
          setView("signup");
          return;
        }
        throw caught;
      }

      finishAuth();
    });

  const submitPhone = () =>
    run(async () => {
      const composed = validatedPhone();
      await schemas.phone.validate(composed);

      try {
        await sendPhoneOtp.mutateAsync({ phone: composed });
      } catch (caught) {
        if (isUnknownAccount(caught)) {
          setLockedField("phone");
          setError("");
          setView("signup");
          return;
        }
        throw caught;
      }

      setOtpPurpose("phone-login");
      setResendIn(30);
      setView("otp");
    });

  const submitSignup = () =>
    run(async () => {
      formik.setErrors({});
      const composed = phoneValidation.e164;
      try {
        await schemas.signup.validate({
          name,
          email,
          phone: composed,
          password: signupPassword,
          confirmPassword,
        }, { abortEarly: false });
      } catch (caught) {
        if (!(caught instanceof ValidationError)) throw caught;
        const seen = new Set<string>();
        for (const issue of caught.inner.length ? caught.inner : [caught]) {
          const field = issue.path === "password" ? "signupPassword" : issue.path;
          if (field && !seen.has(field)) {
            seen.add(field);
            void formik.setFieldError(field, issue.message);
          }
        }
        return;
      }

      try {
        await sendSignupOtp.mutateAsync({
          email: email.trim().toLowerCase(),
          phone: composed!,
        });
      } catch (caught) {
        if (handleSignupConflict(caught)) return;
        if (caught instanceof AuthApiError && caught.status === 429) {
          setError(t("signupRateLimited"));
          return;
        }
        throw caught;
      }
      setOtpPurpose("signup");
      setResendIn(30);
      setView("otp");
    });

  const verifyOtp = () =>
    run(async () => {
      await schemas.otp.validate(otp);
      const composed = validatedPhone();

      if (otpPurpose === "phone-login") {
        await verifyPhoneOtp.mutateAsync({ phone: composed, otp });
      } else {
        try {
          await verifySignupOtp.mutateAsync({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            phone: composed,
            password: signupPassword,
            otp,
          });
        } catch (caught) {
          if (handleSignupConflict(caught)) return;
          throw caught;
        }
      }
      finishAuth();
    });

  const resendOtp = () => {
    if (resendIn > 0 || loading) return;
    void run(async () => {
      const composed = validatedPhone();
      if (otpPurpose === "phone-login") {
        await sendPhoneOtp.mutateAsync({ phone: composed });
      } else {
        try {
          await sendSignupOtp.mutateAsync({
            email: email.trim().toLowerCase(),
            phone: composed,
          });
        } catch (caught) {
          if (handleSignupConflict(caught)) return;
          if (caught instanceof AuthApiError && caught.status === 429) {
            setError(t("signupRateLimited"));
            return;
          }
          throw caught;
        }
      }
      setResendIn(30);
    });
  };

  function handleSignupConflict(caught: unknown) {
    if (!(caught instanceof AuthApiError) || caught.status !== 409) return false;
    const fields = caught.fields?.length
      ? caught.fields
      : caught.code === "SIGNUP_EMAIL_EXISTS"
        ? ["email"]
        : caught.code === "SIGNUP_PHONE_EXISTS"
          ? ["phone"]
          : [];
    if (fields.includes("email")) void formik.setFieldError("email", t("signupEmailExists"));
    if (fields.includes("phone")) void formik.setFieldError("phone", t("signupPhoneExists"));
    if (lockedField && fields.includes(lockedField)) setLockedField(null);
    if (fields.length === 0) setError(t("signupContactExists"));
    setView("signup");
    return true;
  }

  const lockedInput =
    "cursor-not-allowed border-[#e6e8ec] bg-[#f1f2f4] text-[#6c6f76]";

  const otpDestination = phoneValidation.e164 ?? email;
  const backTarget: View =
    view === "otp" && otpPurpose === "signup"
      ? "signup"
      : view === "forgot"
        ? "password"
      : view === "signup"
        ? "login"
        : view === "otp"
          ? "phone"
          : "login";

  return (
    <main className="min-h-[100svh] bg-brand-soft text-[#151619] md:h-[100svh] md:overflow-hidden md:bg-background">
      <section
        className="relative grid min-h-[100svh] w-full grid-cols-1 grid-rows-[auto_1fr] overflow-hidden md:h-full md:min-h-0 md:grid-cols-2 md:grid-rows-1"
        aria-label={t("accountAccess")}
      >
        <div className="relative overflow-hidden bg-brand-soft md:z-[1] md:-mr-[2.5vw]">
          {view === "otp" ? (
            <Image
              src="/auth/two-factor.webp"
              alt={t("verificationImageAlt")}
              width={416}
              height={431}
              className="relative z-[2] mx-auto mb-[clamp(150px,27svh,225px)] mt-[clamp(24px,4svh,44px)] h-auto w-[min(56%,240px)] object-contain md:absolute md:left-1/2 md:mx-0 md:mb-0 md:mt-0 md:-translate-x-1/2 md:top-[clamp(48px,9vh,96px)] md:w-[min(62%,420px)]"
              priority
            />
          ) : (
            <div className="relative z-[2] px-6 pb-[clamp(150px,27svh,225px)] pt-[clamp(32px,6svh,56px)] text-center md:pb-0 md:pl-[12.5%] md:pr-[clamp(24px,3vw,80px)] md:pt-[clamp(56px,22svh,240px)] md:text-left">
              <h1 className="text-[clamp(26px,6.4vw,40px)] font-extrabold leading-[1.4] tracking-[-0.03em] md:max-w-[10.5em] md:text-[clamp(30px,2vw,40px)]">
                {t("heroTitle")} {" "}
                <em className="not-italic text-brand">{t("heroEmphasis")}</em>
              </h1>
              <p className="mx-auto mt-[clamp(18px,2.6vh,40px)] max-w-[42ch] text-[clamp(12px,3.2vw,15px)] leading-[1.65] text-[#346582] md:mx-0 md:max-w-[27em] md:text-[clamp(10px,0.7vw,12px)]">
                {t("heroDescription")}
              </p>
            </div>
          )}
          {/* On desktop the photo is a true oversized circle, matching the
              plate-like crop in the supplied design. Mobile keeps the more
              compact arch so the form remains close to the fold. */}
          <div
            className={`absolute inset-x-0 bottom-0 h-[clamp(130px,24svh,200px)] rounded-[50%_50%_0_0/45%_45%_0_0] bg-white ${
              view === "otp"
                ? "md:h-[34%] md:rounded-[50%_50%_0_0/66%_66%_0_0]"
                : "md:left-1/2 md:right-auto md:bottom-auto md:top-[58%] md:aspect-square md:h-auto md:w-[111%] md:-translate-x-1/2 md:rounded-full"
            }`}
            aria-hidden="true"
          >
            <div
              className={`absolute inset-x-0 bottom-0 top-[clamp(5px,0.6vw,12px)] overflow-hidden rounded-[50%_50%_0_0/45%_45%_0_0] bg-[#3b2315] ${
                view === "otp"
                  ? "md:rounded-[50%_50%_0_0/66%_66%_0_0]"
                  : "md:inset-[clamp(5px,0.6vw,12px)] md:rounded-full"
              }`}
            >
              <Image
                src="/auth/login-food.webp"
                alt=""
                fill
                sizes="(max-width: 860px) 100vw, 55vw"
                className="object-cover object-[center_42%]"
                priority
              />
            </div>
          </div>
        </div>

        <div className="relative z-[3] grid min-w-0 items-start justify-items-center rounded-t-[28px] bg-surface px-[clamp(20px,6vw,44px)] pb-[clamp(32px,6svh,56px)] pt-[72px] shadow-[0_-14px_40px_rgba(63,20,30,0.12)] md:items-center md:overflow-y-auto md:rounded-none md:rounded-l-[32px] md:px-[clamp(24px,4vw,76px)] md:pt-[clamp(36px,6vh,72px)] md:pb-[clamp(60px,14vh,170px)] md:shadow-pop">
          {view !== "login" ? (
            <button
              type="button"
              className="absolute left-4 top-4 grid h-[38px] w-[38px] place-items-center rounded-full border border-brand bg-white text-brand shadow-[0_6px_18px_rgba(63,20,30,0.14)] md:left-[clamp(20px,2.4vw,34px)] md:top-[clamp(20px,3vh,34px)] md:bg-brand/10 md:shadow-none"
              onClick={() => goTo(backTarget)}
              aria-label={t("goBack")}
            >
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                className="w-5 fill-none stroke-current stroke-[1.8] [stroke-linecap:round] [stroke-linejoin:round]"
              >
                <path d="m14.5 6-6 6 6 6" />
              </svg>
            </button>
          ) : (
            <Link
              href="/"
              className="absolute left-4 top-4 inline-flex h-[38px] items-center gap-1.5 rounded-full border border-brand bg-white pl-2.5 pr-3.5 text-[13px] font-semibold text-brand shadow-[0_6px_18px_rgba(63,20,30,0.14)] transition-colors hover:bg-brand/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand md:left-[clamp(20px,2.4vw,34px)] md:top-[clamp(20px,3vh,34px)] md:bg-brand/10 md:shadow-none md:hover:bg-brand/20"
            >
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                className="w-5 fill-none stroke-current stroke-[1.8] [stroke-linecap:round] [stroke-linejoin:round] rtl:-scale-x-100"
              >
                <path d="m14.5 6-6 6 6 6" />
              </svg>
              {t("backToHome")}
            </Link>
          )}

          <div className="mx-auto w-[min(100%,420px)] transition-[opacity,translate] duration-500 ease-[cubic-bezier(0.22,0.9,0.3,1)] starting:translate-y-3 starting:opacity-0 motion-reduce:transition-none md:mx-0 md:w-[min(100%,clamp(260px,30vw,420px))]">
            <AuthBrand centered={view === "otp"} />

            {view === "login" ? (
              <form className={formShell} onSubmit={formik.handleSubmit} noValidate>
                <header className={formHeading}>
                  <h2 className={formTitle}>{t("title")}</h2>
                  <p className={formSubtitle}>{t("subtitle")}</p>
                </header>
                <label className={fieldShell}>
                  <span className={fieldLabel}>{t("email")}</span>
                  <input
                    className={fieldInput}
                    value={email}
                    onChange={(event) => void formik.setFieldValue("email", event.target.value, false)}
                    placeholder={t("emailPlaceholder")}
                    type="email"
                    autoComplete="email"
                    disabled={loading}
                  />
                </label>
                {error ? <p className={errorNote} role="alert">{error}</p> : null}
                <button className={submitButton} disabled={loading} type="submit">
                  {loading ? t("checking") : common("continue")}
                </button>
                <SocialAuthButtons
                  onAuthenticated={finishAuth}
                  onError={setError}
                />
                <button
                  className={`${inlineAction} self-center text-[clamp(12px,0.8vw,14px)]`}
                  type="button"
                  onClick={() => goTo("phone")}
                >
                  {t("signInMobile")}
                </button>
                <p className={`${footNote} mt-[clamp(2px,0.8vh,6px)]`}>
                  {t("agreement")} {" "}
                  <Link className={inlineAction} href="/">{t("conditions")}</Link>{" "}
                  {t("ofUse")} {" "}
                  <Link className={inlineAction} href="/">{t("privacy")}</Link>.
                </p>
              </form>
            ) : null}

            {view === "password" ? (
              <form className={formShell} onSubmit={formik.handleSubmit} noValidate>
                <header className={formHeading}>
                  <h2 className={formTitle}>{t("passwordTitle")}</h2>
                  <p className={formSubtitle}>
                    {t("signingInAs")} <strong>{email.trim()}</strong>
                  </p>
                </header>
                <label className={fieldShell}>
                  <span className={fieldLabel}>{t("password")}</span>
                  <PasswordInput
                    value={password}
                    onChange={(event) => void formik.setFieldValue("password", event.target.value, false)}
                    placeholder={t("passwordPlaceholder")}
                    autoComplete="current-password"
                    disabled={loading}
                  />
                </label>
                {error ? <p className={errorNote} role="alert">{error}</p> : null}
                <button className={submitButton} disabled={loading} type="submit">
                  {loading ? t("pleaseWait") : common("continue")}
                </button>
                <button className={`${inlineAction} self-center text-[clamp(12px,0.8vw,14px)]`} type="button" onClick={() => { void formik.setFieldValue("password", "", false); goTo("forgot"); }}>
                  {t("forgotPassword")}
                </button>
                <p className={footNote}>
                  {t("newToSipp")} {" "}
                  <button className={inlineAction} type="button" onClick={() => goTo("signup")}>
                    {t("createAccount")}
                  </button>
                </p>
              </form>
            ) : null}

            {view === "forgot" ? (
              <ForgotPasswordFlow
                initialEmail={email}
                onReturnToLogin={() => goTo("password")}
              />
            ) : null}

            {view === "phone" ? (
              <form className={formShell} onSubmit={formik.handleSubmit} noValidate>
                <header className={formHeading}>
                  <h2 className={formTitle}>{t("mobileTitle")}</h2>
                  <p className={formSubtitle}>{t("mobileSubtitle")}</p>
                </header>
                <label className={fieldShell}>
                  <span className={fieldLabel}>{t("mobile")}</span>
                  <span className={`relative flex h-[clamp(48px,3vw,58px)] items-center rounded-[9px] border bg-[#fbfbfc] focus-within:bg-white focus-within:shadow-[0_0_0_3px_rgba(102,192,242,0.1)] ${phoneIsInvalid ? "border-danger" : phoneValidation.isValid ? "border-emerald-500" : "border-brand focus-within:border-brand"}`}>
                    {countryLookupPending ? (
                      <span className="grid h-full min-w-20 place-items-center border-e border-line text-brand" role="status" aria-label={t("pleaseWait")}>
                        <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
                      </span>
                    ) : (
                      <CountrySelect value={country} onChange={changeCountry} disabled={loading} />
                    )}
                    <input
                      className="h-full w-full border-0 bg-transparent px-4 text-[clamp(13px,1.1vw,16px)] text-[#181a1e] caret-brand outline-none placeholder:text-[#9a9da4]"
                      value={phone}
                      onChange={(event) => changePhone(event.target.value)}
                      placeholder={selectedPhoneExample || t("phonePlaceholder")}
                      inputMode="tel"
                      autoComplete="tel"
                      maxLength={22}
                      aria-invalid={phoneIsInvalid}
                      aria-describedby="login-phone-guidance"
                      disabled={loading || countryLookupPending}
                    />
                  </span>
                  <small id="login-phone-guidance" aria-live="polite" className={`text-[11px] leading-5 ${phoneIsInvalid ? "font-medium text-danger" : phoneValidation.isValid ? "font-medium text-emerald-700 dark:text-emerald-300" : "text-[#8a8d94]"}`}>
                    {phoneValidation.isValid ? t("phoneValid") : phoneGuidance}
                  </small>
                </label>
                {error ? <p className={errorNote} role="alert">{error}</p> : null}
                <button className={submitButton} disabled={loading || !phoneValidation.isValid} type="submit">
                  {loading ? t("sendingCode") : common("continue")}
                </button>
                <button
                  className={`${inlineAction} self-center text-[clamp(12px,0.95vw,14px)]`}
                  type="button"
                  onClick={() => goTo("login")}
                >
                  {t("signInEmail")}
                </button>
              </form>
            ) : null}

            {view === "otp" ? (
              <form className={`${formShell} text-center`} onSubmit={formik.handleSubmit} noValidate>
                <header className={formHeading}>
                  <h2 className={formTitle}>{t("verifyCode")}</h2>
                  <p className={formSubtitle}>
                    {t("codeSentTo")} <strong>{otpDestination}</strong>
                  </p>
                </header>
                <OtpInput value={otp} onChange={(value) => void formik.setFieldValue("otp", value, false)} disabled={loading} centered />
                <button
                  type="button"
                  className="self-center text-[clamp(11px,0.9vw,13px)] font-bold text-brand disabled:cursor-default disabled:text-[#787b82]"
                  onClick={resendOtp}
                  disabled={resendIn > 0 || loading}
                >
                  {resendIn > 0
                    ? t("resendIn", { time: `0:${String(resendIn).padStart(2, "0")}` })
                    : t("resendCode")}
                </button>
                {error ? <p className={errorNote} role="alert">{error}</p> : null}
                <button className={submitButton} disabled={loading} type="submit">
                  {loading ? t("verifying") : t("verify")}
                </button>
                <p className={footNote}>
                  {t("codeHelp")}
                </p>
              </form>
            ) : null}

            {view === "signup" ? (
              <form
                className="flex flex-col gap-[clamp(10px,1.4vh,14px)]"
                onSubmit={formik.handleSubmit}
                noValidate
              >
                <header className={formHeading}>
                  <h2 className={formTitle}>{t("createAccount")}</h2>
                  <p className={formSubtitle}>
                    {t("signupSubtitle")}
                  </p>
                </header>
                <label className="flex flex-col gap-1.5">
                  <span className={fieldLabel}>{t("fullName")}</span>
                  <input
                    className={`${fieldInput} h-[clamp(42px,5.2vh,48px)]`}
                    value={name}
                    onChange={(event) => { void formik.setFieldValue("name", event.target.value, false); void formik.setFieldError("name", undefined); }}
                    placeholder={t("namePlaceholder")}
                    autoComplete="name"
                    aria-invalid={Boolean(formik.errors.name)}
                    aria-describedby={formik.errors.name ? "signup-name-error" : undefined}
                    disabled={loading}
                  />
                  {formik.errors.name ? <small id="signup-name-error" className={errorNote} role="alert">{formik.errors.name}</small> : null}
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className={fieldLabel}>{t("email")}</span>
                  <input
                    className={`${fieldInput} h-[clamp(42px,5.2vh,48px)] ${
                      lockedField === "email" ? lockedInput : ""
                    }`}
                    value={email}
                    onChange={(event) => { void formik.setFieldValue("email", event.target.value, false); void formik.setFieldError("email", undefined); }}
                    placeholder="name@example.com"
                    type="email"
                    autoComplete="email"
                    readOnly={lockedField === "email"}
                    aria-invalid={Boolean(formik.errors.email)}
                    aria-describedby={
                      formik.errors.email ? "signup-email-error" : lockedField === "email" ? "signup-email-locked" : undefined
                    }
                    disabled={loading}
                  />
                  {lockedField === "email" ? (
                    <small id="signup-email-locked" className="text-[11px] text-[#8a8d94]">
                      {t("lockedEmail")} {" "}
                      <button
                        className={inlineAction}
                        type="button"
                        onClick={() => goTo("login")}
                      >
                        {t("useDifferent")}
                      </button>
                    </small>
                  ) : null}
                  {formik.errors.email ? <small id="signup-email-error" className={errorNote} role="alert">{formik.errors.email}</small> : null}
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className={fieldLabel}>{t("mobile")}</span>
                  <span
                    className={`relative flex h-[clamp(42px,5.2vh,48px)] items-center rounded-[9px] border ${
                      lockedField === "phone"
                        ? "border-[#e6e8ec] bg-[#f1f2f4]"
                        : `${phoneIsInvalid ? "border-danger" : phoneValidation.isValid ? "border-emerald-500" : "border-brand focus-within:border-brand"} bg-[#fbfbfc] focus-within:bg-white focus-within:shadow-[0_0_0_3px_rgba(102,192,242,0.1)]`
                    }`}
                  >
                    {countryLookupPending ? (
                      <span className="grid h-full min-w-20 place-items-center border-e border-line text-brand" role="status" aria-label={t("pleaseWait")}>
                        <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
                      </span>
                    ) : (
                      <CountrySelect value={country} onChange={changeCountry} disabled={loading || lockedField === "phone"} />
                    )}
                    <input
                      className={`h-full w-full border-0 bg-transparent px-4 text-[clamp(13px,1.1vw,16px)] caret-brand outline-none placeholder:text-[#9a9da4] ${
                        lockedField === "phone"
                          ? "cursor-not-allowed text-[#6c6f76]"
                          : "text-[#181a1e]"
                      }`}
                      value={phone}
                      onChange={(event) => changePhone(event.target.value)}
                      placeholder={selectedPhoneExample || t("phonePlaceholder")}
                      inputMode="tel"
                      autoComplete="tel"
                      maxLength={22}
                      readOnly={lockedField === "phone"}
                      aria-invalid={phoneIsInvalid || Boolean(formik.errors.phone)}
                      aria-describedby={
                        formik.errors.phone ? "signup-phone-error" : lockedField === "phone" ? "signup-phone-locked" : "signup-phone-guidance"
                      }
                      disabled={loading || countryLookupPending}
                    />
                  </span>
                  {lockedField === "phone" ? (
                    <small id="signup-phone-locked" className="text-[11px] text-[#8a8d94]">
                      {t("lockedPhone")} {" "}
                      <button
                        className={inlineAction}
                        type="button"
                        onClick={() => goTo("phone")}
                      >
                        {t("useDifferent")}
                      </button>
                    </small>
                  ) : (
                    <small id="signup-phone-guidance" aria-live="polite" className={`text-[11px] leading-5 ${phoneIsInvalid ? "font-medium text-danger" : phoneValidation.isValid ? "font-medium text-emerald-700 dark:text-emerald-300" : "text-[#8a8d94]"}`}>
                      {phoneValidation.isValid ? t("phoneValid") : phoneGuidance}
                    </small>
                  )}
                  {formik.errors.phone ? <small id="signup-phone-error" className={errorNote} role="alert">{formik.errors.phone}</small> : null}
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className={fieldLabel}>{t("password")}</span>
                  <PasswordInput
                    className="h-[clamp(42px,5.2vh,48px)]"
                    value={signupPassword}
                    onChange={(event) => { void formik.setFieldValue("signupPassword", event.target.value, false); void formik.setFieldError("signupPassword", undefined); }}
                    placeholder={t("newPasswordPlaceholder")}
                    autoComplete="new-password"
                    aria-invalid={Boolean(formik.errors.signupPassword)}
                    aria-describedby="signup-password-guidance"
                    disabled={loading}
                  />
                  <small id="signup-password-guidance" className="text-[11px] text-muted">{t("signupInvalidPassword")}</small>
                  {formik.errors.signupPassword ? <small className={errorNote} role="alert">{formik.errors.signupPassword}</small> : null}
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className={fieldLabel}>{t("confirmPassword")}</span>
                  <PasswordInput
                    className="h-[clamp(42px,5.2vh,48px)]"
                    value={confirmPassword}
                    onChange={(event) => { void formik.setFieldValue("confirmPassword", event.target.value, false); void formik.setFieldError("confirmPassword", undefined); }}
                    placeholder={t("confirmPasswordPlaceholder")}
                    autoComplete="new-password"
                    aria-invalid={Boolean(formik.errors.confirmPassword)}
                    disabled={loading}
                  />
                  {formik.errors.confirmPassword ? <small className={errorNote} role="alert">{formik.errors.confirmPassword}</small> : null}
                </label>
                {error ? <p className={errorNote} role="alert">{error}</p> : null}
                <button className={submitButton} disabled={loading || !phoneValidation.isValid} type="submit">
                  {loading ? t("sendingCode") : t("verifyMobile")}
                </button>
                <p className={footNote}>
                  {t("signupAgreement")} {" "}
                  <Link className={inlineAction} href="/">{t("terms")}</Link> {t("and")} {" "}
                  <Link className={inlineAction} href="/">{t("privacyPolicy")}</Link>.
                </p>
                <p className={footNote}>
                  {t("alreadyAccount")} {" "}
                  <button className={inlineAction} type="button" onClick={() => goTo("login")}>
                    {t("login")}
                  </button>
                </p>
              </form>
            ) : null}
          </div>
        </div>
      </section>
    </main>
  );
}
