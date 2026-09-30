"use client";

import { LocateFixed } from "lucide-react";
import { useTranslations } from "next-intl";
import { LocationAlert } from "@/modules/account/components/location/steps/LocationAlert";
import { LocationStepHeader } from "@/modules/account/components/location/steps/LocationStepHeader";
import {
  PRIMARY_BUTTON,
  SECONDARY_BUTTON,
  SUMMARY_CARD,
} from "@/modules/account/components/location/steps/styles";

interface Props {
  isLocating: boolean;
  error: string;
  onAllow: () => void;
  onSearchManually: () => void;
  onBack: () => void;
  onClose: () => void;
}

export function CurrentLocationStep({
  isLocating,
  error,
  onAllow,
  onSearchManually,
  onBack,
  onClose,
}: Props) {
  const t = useTranslations("location");

  return (
    <>
      <LocationStepHeader title={t("current")} onBack={onBack} onClose={onClose} />

      <div className="flex-1 overflow-y-auto px-5 pb-6 sm:px-6">
        <div className={SUMMARY_CARD}>
          <LocateFixed aria-hidden="true" className="mt-0.5 size-4.5 flex-none text-brand" />
          <div className="min-w-0">
            <strong className="block text-sm font-medium text-ink">
              {t("allowAccessTitle")}
            </strong>
            <p className="mt-1 text-[13px] leading-relaxed text-muted">
              {t("allowAccessDescription")}
            </p>
          </div>
        </div>

        <LocationAlert message={error} />

        <button
          type="button"
          onClick={onAllow}
          disabled={isLocating}
          className={`${PRIMARY_BUTTON} mt-6`}
        >
          {isLocating ? t("findingYou") : t("allowLocation")}
        </button>
        <button type="button" onClick={onSearchManually} className={`${SECONDARY_BUTTON} mt-2.5`}>
          {t("searchManually")}
        </button>
      </div>
    </>
  );
}
