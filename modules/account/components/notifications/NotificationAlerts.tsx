"use client";

import Link from "next/link";
import { BellRing, Volume2, VolumeX, X } from "lucide-react";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { useNotificationLiveSync } from "@/modules/account/hooks/useNotificationLiveSync";

export function NotificationAlerts() {
  const t = useTranslations("notificationInbox");
  const { authenticated, alert, dismiss, isSoundEnabled, enableSound, disableSound } = useNotificationLiveSync();
  const [soundError, setSoundError] = useState(false);

  if (!authenticated) return null;

  const toggleSound = async () => {
    if (isSoundEnabled) { disableSound(); setSoundError(false); return; }
    setSoundError(!(await enableSound()));
  };

  return (
    <div className="pointer-events-none fixed right-4 top-20 z-[90] flex w-[min(380px,calc(100vw-32px))] flex-col items-end gap-2 sm:right-6 sm:top-24">
      {alert ? (
        <div role="status" aria-live="polite" className="pointer-events-auto w-full overflow-hidden rounded-2xl border border-line bg-card shadow-pop">
          <div className="flex items-start gap-3 p-4">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand"><BellRing className="size-5" aria-hidden="true" /></span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold uppercase tracking-wide text-brand">{t("newAlert")}</p>
              <p className="mt-1 break-words text-sm font-bold text-ink">{alert.title}</p>
              <p className="mt-1 break-words text-xs leading-5 text-body">{alert.body}</p>
            </div>
            <button type="button" onClick={dismiss} aria-label={t("dismissAlert")} className="grid size-8 shrink-0 place-items-center rounded-lg text-muted hover:bg-soft-surface hover:text-ink focus-visible:outline-2 focus-visible:outline-brand"><X className="size-4" /></button>
          </div>
          <div className="flex items-center justify-end border-t border-line px-4 py-2">
            <Link href={alert.href ?? "/notifications"} onClick={dismiss} className="rounded-lg px-3 py-2 text-xs font-bold text-brand hover:bg-brand-soft focus-visible:outline-2 focus-visible:outline-brand">{t("viewAlert")}</Link>
          </div>
        </div>
      ) : null}
      <button type="button" onClick={() => void toggleSound()} aria-label={t(isSoundEnabled ? "disableSound" : "enableSound")} className="pointer-events-auto inline-flex min-h-10 items-center gap-2 rounded-full border border-line bg-card px-3 py-2 text-xs font-semibold text-ink shadow-card hover:border-brand focus-visible:outline-2 focus-visible:outline-brand">
        {isSoundEnabled ? <Volume2 className="size-4 text-brand" aria-hidden="true" /> : <VolumeX className="size-4 text-muted" aria-hidden="true" />}
        {t(isSoundEnabled ? "soundOn" : "soundOff")}
      </button>
      {soundError ? <p role="alert" className="pointer-events-auto rounded-lg bg-card px-3 py-2 text-xs text-danger shadow-card">{t("soundUnavailable")}</p> : null}
    </div>
  );
}
