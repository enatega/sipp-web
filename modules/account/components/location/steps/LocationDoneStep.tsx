"use client";

import { Check, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { PRIMARY_BUTTON } from "@/modules/account/components/location/steps/styles";

interface Props {
  address: string;
  didSave: boolean;
  actionLabel: string;
  onClose: () => void;
}

export function LocationDoneStep({ address, didSave, actionLabel, onClose }: Props) {
  const t = useTranslations("location");

  return (
    <div className="relative px-5 pb-6 pt-8 text-center sm:px-6">
      <button
        type="button"
        onClick={onClose}
        aria-label={t("close")}
        className="absolute end-4 top-4 grid size-9 place-items-center rounded-lg text-ink outline-none hover:bg-soft-surface focus-visible:ring-2 focus-visible:ring-brand"
      >
        <X aria-hidden="true" className="size-4.5" />
      </button>
      <span className="mx-auto grid size-13 place-items-center rounded-full bg-brand-soft text-brand">
        <Check aria-hidden="true" className="size-6" />
      </span>
      <h2 id="location-modal-title" className="mt-4 text-[21px] font-semibold text-ink">
        {t("doneTitle")}
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-muted">{address}</p>
      {didSave ? (
        <p className="mt-1 text-sm leading-relaxed text-muted">{t("doneSaved")}</p>
      ) : null}
      <button type="button" onClick={onClose} className={`${PRIMARY_BUTTON} mt-6`}>
        {actionLabel}
      </button>
    </div>
  );
}
