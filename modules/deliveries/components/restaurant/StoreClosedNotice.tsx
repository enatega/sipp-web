"use client";

import { useState } from "react";
import { LoaderCircle } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import type { StoreOpeningHours } from "../../types/restaurant";

const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"] as const;

interface Props {
  openingHours: StoreOpeningHours | null;
  /** Re-checks the store; resolves to whether it is still closed. */
  onCheckAvailability: () => Promise<boolean>;
}

export function StoreClosedNotice({ openingHours, onCheckAvailability }: Props) {
  const t = useTranslations("deliveries.restaurant");
  const locale = useLocale();
  const [isChecking, setIsChecking] = useState(false);
  const [isStillClosed, setIsStillClosed] = useState(false);
  // 2024-01-01 is a Monday, so index i maps to DAYS[i] for localised names.
  const dayName = (index: number) =>
    new Intl.DateTimeFormat(locale, { weekday: "long", timeZone: "UTC" }).format(new Date(Date.UTC(2024, 0, 1 + index)));

  async function check() {
    setIsChecking(true);
    setIsStillClosed(false);
    try {
      setIsStillClosed(await onCheckAvailability());
    } finally {
      setIsChecking(false);
    }
  }

  return (
    <div role="status" className="mb-6 rounded-xl border border-line bg-soft-surface p-4 text-body">
      <strong className="block text-ink">{t("closed")}</strong>
      <p className="mt-1 text-sm">{t("closedMessage")}</p>
      {openingHours ? (
        <div className="mt-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">{t("openingHours")}</p>
          <dl className="mt-2 grid max-w-sm grid-cols-[auto_1fr] gap-x-6 gap-y-1 text-sm">
            {DAYS.map((day, index) => {
              const hours = openingHours[day];
              return (
                <div key={day} className="contents">
                  <dt className="text-ink">{dayName(index)}</dt>
                  <dd>{hours?.isOpen ? hours.slots.map((slot) => `${slot.open}–${slot.close}`).join(", ") : t("closedAllDay")}</dd>
                </div>
              );
            })}
          </dl>
        </div>
      ) : null}
      <button type="button" disabled={isChecking} className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-brand underline underline-offset-4 disabled:opacity-60" onClick={() => void check()}>
        {isChecking ? <LoaderCircle aria-hidden="true" className="size-4 animate-spin" /> : null}
        {t("checkAvailability")}
      </button>
      {isStillClosed && !isChecking ? <p className="mt-2 text-sm text-ink">{t("stillClosed")}</p> : null}
    </div>
  );
}
