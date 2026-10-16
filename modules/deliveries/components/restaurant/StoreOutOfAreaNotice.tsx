"use client";

import { MapPinOff } from "lucide-react";
import { useTranslations } from "next-intl";

export function StoreOutOfAreaNotice() {
  const t = useTranslations("deliveries.restaurant");

  return (
    <div
      role="status"
      className="mb-6 flex items-start gap-3 rounded-xl border border-brand/25 bg-brand/10 p-4 text-body"
    >
      <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-full bg-card text-brand">
        <MapPinOff aria-hidden="true" className="size-4" />
      </span>
      <div className="min-w-0">
        <strong className="block text-ink">{t("outsideAreaTitle")}</strong>
        <p className="mt-1 text-sm leading-6">{t("outsideAreaMessage")}</p>
      </div>
    </div>
  );
}
