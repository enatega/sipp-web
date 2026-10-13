"use client";

import { Clock3 } from "lucide-react";
import { useTranslations } from "next-intl";

interface Props {
  onViewOpeningHours: () => void;
}

export function StoreClosedNotice({ onViewOpeningHours }: Props) {
  const t = useTranslations("deliveries.restaurant");

  return (
    <div className="mb-6 rounded-xl border border-line bg-soft-surface p-4 text-body">
      <strong className="block text-ink">{t("closed")}</strong>
      <p className="mt-1 text-sm leading-6">{t("closedMessage")}</p>
      <button type="button" className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-xl border border-brand bg-card px-4 text-sm font-semibold text-brand transition-colors hover:bg-brand/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand" onClick={onViewOpeningHours}>
        <Clock3 aria-hidden="true" className="size-4" />
        {t("checkAvailability")}
      </button>
    </div>
  );
}
