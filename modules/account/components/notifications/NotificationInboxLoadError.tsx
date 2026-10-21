"use client";

import { LoaderCircle, RefreshCw } from "lucide-react";
import { useTranslations } from "next-intl";

interface Props {
  isRetrying: boolean;
  onRetry: () => void;
}

export function NotificationInboxLoadError({ isRetrying, onRetry }: Props) {
  const t = useTranslations("notificationInbox");
  return (
    <div className="mx-auto grid min-h-[420px] max-w-lg place-items-center text-center" role="alert">
      <div>
        <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-danger-soft text-danger">
          <RefreshCw aria-hidden="true" className="size-6" />
        </span>
        <h2 className="mt-5 text-lg font-bold text-ink">{t("loadErrorTitle")}</h2>
        <p className="mt-2 text-sm leading-6 text-body">{t("loadErrorMessage")}</p>
        <button
          className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-brand px-6 text-sm font-bold text-ink transition-colors hover:bg-brand/85 disabled:opacity-55"
          disabled={isRetrying}
          onClick={onRetry}
          type="button"
        >
          {isRetrying ? <LoaderCircle aria-hidden="true" className="size-4 animate-spin" /> : <RefreshCw aria-hidden="true" className="size-4" />}
          {t("retry")}
        </button>
      </div>
    </div>
  );
}
