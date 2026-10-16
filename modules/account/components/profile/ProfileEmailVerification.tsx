"use client";

import { useEffect, useRef, useState } from "react";
import { Mail, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { createPortal } from "react-dom";
import { profileApi } from "@/modules/account/api/profile";
import { OtpInput } from "@/modules/account/components/auth/OtpInput";
import { ApiError } from "@/services/api/client";

type ProfileEmailVerificationProps = {
  email: string;
  onClose: () => void;
  onVerified: () => Promise<unknown>;
};

function formatCountdown(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  return `${minutes}:${String(seconds % 60).padStart(2, "0")}`;
}

export function ProfileEmailVerification({
  email,
  onClose,
  onVerified,
}: ProfileEmailVerificationProps) {
  const t = useTranslations("profileInformation");
  const [codeSent, setCodeSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [expiresAt, setExpiresAt] = useState(0);
  const [resendAt, setResendAt] = useState(0);
  const [now, setNow] = useState(() => Date.now());
  const attempted = useRef("");
  const dialogRef = useRef<HTMLDivElement>(null);

  const expiryRemaining = expiresAt
    ? Math.max(0, Math.ceil((expiresAt - now) / 1000))
    : 0;
  const resendRemaining = resendAt
    ? Math.max(0, Math.ceil((resendAt - now) / 1000))
    : 0;
  const expired = codeSent && expiryRemaining === 0;

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const frame = window.requestAnimationFrame(() =>
      dialogRef.current?.querySelector<HTMLButtonElement>("[data-email-send]")?.focus(),
    );
    return () => {
      window.cancelAnimationFrame(frame);
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    if (!expiresAt && !resendAt) return;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [expiresAt, resendAt]);

  useEffect(() => {
    if (codeSent) {
      dialogRef.current
        ?.querySelector<HTMLInputElement>('input[inputmode="numeric"]')
        ?.focus();
    } else if (success) {
      dialogRef.current?.querySelector<HTMLButtonElement>("[data-email-done]")?.focus();
    }
  }, [codeSent, success]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !busy) onClose();
      if (event.key !== "Tab") return;
      const focusable = Array.from(
        dialogRef.current?.querySelectorAll<HTMLElement>(
          'button:not(:disabled), input:not(:disabled), [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      );
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [busy, onClose]);

  const messageFor = (reason: unknown, fallback: string) => {
    if (reason instanceof ApiError) {
      if (reason.status === 429) return t("emailRateLimited");
      if (reason.status === 503) return t("emailSendError");
      if (/expired|already been used/i.test(reason.message)) return t("emailExpired");
      if (/invalid verification code/i.test(reason.message)) return t("emailCodeError");
    }
    return reason instanceof Error ? reason.message : fallback;
  };

  async function sendCode() {
    if (busy || resendRemaining > 0) return;
    setBusy(true);
    setError("");
    try {
      const response = await profileApi.sendEmailVerification();
      const timestamp = Date.now();
      setNow(timestamp);
      setExpiresAt(timestamp + response.expiresInSeconds * 1000);
      setResendAt(timestamp + response.resendAfterSeconds * 1000);
      setCodeSent(true);
      setOtp("");
      attempted.current = "";
    } catch (reason) {
      if (reason instanceof ApiError && reason.retryAfterSeconds) {
        const timestamp = Date.now();
        setNow(timestamp);
        setResendAt(timestamp + reason.retryAfterSeconds * 1000);
      }
      setError(messageFor(reason, t("emailSendError")));
    } finally {
      setBusy(false);
    }
  }

  async function verifyCode(value: string) {
    if (!codeSent || expired || !/^\d{4}$/.test(value) || busy) return;
    setBusy(true);
    setError("");
    try {
      await profileApi.verifyEmailVerification({ email, otp: value });
      await onVerified();
      setCodeSent(false);
      setOtp("");
      setSuccess(true);
    } catch (reason) {
      setError(messageFor(reason, t("emailCodeError")));
      attempted.current = "";
    } finally {
      setBusy(false);
    }
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[110] flex items-end justify-center bg-black/60 p-0 backdrop-blur-[2px] sm:items-center sm:p-5"
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-email-title"
      onClick={(event) => {
        if (event.target === event.currentTarget && !busy) onClose();
      }}
    >
      <div
        ref={dialogRef}
        className="max-h-[94svh] w-full max-w-[520px] overflow-y-auto rounded-t-[28px] bg-card px-5 pb-[max(24px,env(safe-area-inset-bottom))] pt-6 shadow-[0_28px_80px_rgba(0,0,0,0.28)] sm:rounded-[28px] sm:p-8"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2
              id="profile-email-title"
              className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl"
            >
              {t("emailVerifyTitle")}
            </h2>
            <p className="mt-2 text-sm leading-6 text-body">
              {t("emailVerifyDescription")}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            aria-label={t("emailClose")}
            className="grid size-10 shrink-0 place-items-center rounded-full bg-[var(--soft-surface)] text-body transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-brand disabled:opacity-50"
          >
            <X aria-hidden="true" className="size-5" />
          </button>
        </div>

        {!codeSent && !success ? (
          <div className="mt-6">
            <div className="flex items-center gap-3 rounded-xl border border-line bg-[var(--soft-surface)] p-4">
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-brand/10 text-brand">
                <Mail aria-hidden="true" className="size-4" />
              </span>
              <span className="min-w-0 break-all text-sm font-medium text-foreground">
                {email}
              </span>
            </div>
            <button
              data-email-send
              type="button"
              onClick={() => void sendCode()}
              disabled={busy || resendRemaining > 0}
              className="mt-5 min-h-11 rounded-full bg-brand px-5 text-sm font-semibold text-ink disabled:cursor-not-allowed disabled:opacity-50"
            >
              {busy
                ? t("emailWorking")
                : resendRemaining > 0
                  ? t("emailResendIn", { time: formatCountdown(resendRemaining) })
                  : t("emailSend")}
            </button>
          </div>
        ) : codeSent ? (
          <div className="mt-6">
            <p className="text-sm font-medium text-foreground">
              {t("emailCodeSent", { email })}
            </p>
            <p aria-live="polite" className={`mt-1 text-xs ${expired ? "text-danger" : "text-body"}`}>
              {expired
                ? t("emailExpired")
                : t("emailCodeExpires", { time: formatCountdown(expiryRemaining) })}
            </p>
            <OtpInput
              value={otp}
              onChange={(value) => {
                setOtp(value);
                setError("");
                if (value.length < 4) attempted.current = "";
                if (
                  /^\d{4}$/.test(value) &&
                  !expired &&
                  attempted.current !== value
                ) {
                  attempted.current = value;
                  void verifyCode(value);
                }
              }}
              disabled={busy || expired}
            />
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => void verifyCode(otp)}
                disabled={busy || expired || otp.length !== 4}
                className="min-h-11 rounded-full bg-brand px-5 text-sm font-semibold text-ink disabled:cursor-not-allowed disabled:opacity-50"
              >
                {busy ? t("emailWorking") : t("emailVerify")}
              </button>
              <button
                type="button"
                onClick={() => void sendCode()}
                disabled={busy || resendRemaining > 0}
                className="min-h-11 px-3 text-sm font-semibold text-brand disabled:cursor-not-allowed disabled:text-body"
              >
                {resendRemaining > 0
                  ? t("emailResendIn", { time: formatCountdown(resendRemaining) })
                  : t("emailResend")}
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-6">
            <p role="status" className="text-sm font-medium text-[#137e52] dark:text-[#63d8a5]">
              {t("emailSuccess")}
            </p>
            <button
              data-email-done
              type="button"
              onClick={onClose}
              className="mt-5 min-h-11 rounded-full bg-brand px-6 text-sm font-semibold text-ink"
            >
              {t("emailClose")}
            </button>
          </div>
        )}

        {error ? (
          <p role="alert" className="mt-4 text-sm text-danger">
            {error}
          </p>
        ) : null}
      </div>
    </div>,
    document.body,
  );
}
