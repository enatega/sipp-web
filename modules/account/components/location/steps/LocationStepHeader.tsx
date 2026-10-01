"use client";

import { ArrowLeft, X } from "lucide-react";
import { useTranslations } from "next-intl";

interface Props {
  title: string;
  onClose: () => void;
  onBack?: () => void;
}

const ICON_BUTTON =
  "grid size-9 flex-none place-items-center rounded-lg text-ink outline-none transition-colors hover:bg-soft-surface focus-visible:ring-2 focus-visible:ring-brand";

export function LocationStepHeader({ title, onClose, onBack }: Props) {
  const t = useTranslations("location");

  return (
    <header className="flex items-center gap-3 px-5 pb-4 pt-5 sm:px-6 sm:pt-6">
      {onBack ? (
        <button
          type="button"
          onClick={onBack}
          aria-label={t("back")}
          className={ICON_BUTTON}
        >
          <ArrowLeft aria-hidden="true" className="size-4.5 rtl:rotate-180" />
        </button>
      ) : null}
      <h2
        id="location-modal-title"
        className="min-w-0 flex-1 text-[21px] font-semibold leading-tight text-ink"
      >
        {title}
      </h2>
      <button
        type="button"
        onClick={onClose}
        aria-label={t("close")}
        className={ICON_BUTTON}
      >
        <X aria-hidden="true" className="size-4.5" />
      </button>
    </header>
  );
}
