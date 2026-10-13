"use client";

import Link from "next/link";
import { BellRing, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useNotificationLiveSync } from "@/modules/account/hooks/useNotificationLiveSync";
import { useMarkNotificationReadMutation } from "@/modules/account/queries/useNotificationInboxQueries";

export function NotificationAlerts() {
  const t = useTranslations("notificationInbox");
  const { authenticated, alert, dismiss } = useNotificationLiveSync();
  const markRead = useMarkNotificationReadMutation();

  if (!authenticated || !alert) return null;

  return (
    <div role="status" aria-live="polite" className="fixed bottom-4 right-4 z-[90] w-[min(380px,calc(100vw-32px))] overflow-hidden rounded-2xl border border-line bg-card shadow-pop sm:bottom-6 sm:right-6">
      <Link
        href={alert.href ?? "/notifications"}
        onClick={() => {
          markRead.mutate(alert.id);
          dismiss();
        }}
        className="flex items-start gap-3 p-4 pr-12 transition-colors hover:bg-brand-soft focus-visible:outline-2 focus-visible:outline-brand"
      >
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand"><BellRing className="size-5" aria-hidden="true" /></span>
        <span className="min-w-0 flex-1">
          <span className="block break-words text-sm font-bold text-ink">{alert.title}</span>
          <span className="mt-1 block break-words text-xs leading-5 text-body">{alert.body}</span>
        </span>
      </Link>
      <button type="button" onClick={dismiss} aria-label={t("dismissAlert")} className="absolute right-3 top-3 grid size-8 place-items-center rounded-lg text-muted hover:bg-soft-surface hover:text-ink focus-visible:outline-2 focus-visible:outline-brand"><X className="size-4" /></button>
    </div>
  );
}
