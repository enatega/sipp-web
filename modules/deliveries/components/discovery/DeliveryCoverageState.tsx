"use client";

import { AlertCircle, MapPinOff, RefreshCw } from "lucide-react";
import { useTranslations } from "next-intl";
import { LocationTrigger } from "@/modules/account";

interface Props {
  isError?: boolean;
  isMissingLocation?: boolean;
  onRetry?: () => void;
}

export function DeliveryCoverageState({ isError = false, isMissingLocation = false, onRetry }: Props) {
  const t = useTranslations("deliveries.discovery");
  const Icon = isError ? AlertCircle : MapPinOff;

  return (
    <section className="app-wrap flex min-h-[58svh] items-center justify-center py-16 sm:py-24" role="status">
      <div className="flex max-w-xl flex-col items-center text-center">
        <span className="grid size-20 place-items-center rounded-full bg-brand-soft text-brand sm:size-24">
          <Icon aria-hidden="true" className="size-9 sm:size-11" strokeWidth={1.5} />
        </span>
        <h2 className="mt-7 font-heading text-2xl font-extrabold tracking-[-0.03em] text-ink sm:text-4xl">
          {t(isMissingLocation ? "locationRequiredTitle" : isError ? "coverageErrorTitle" : "outsideAreaTitle")}
        </h2>
        <p className="mt-3 max-w-md text-sm leading-6 text-body sm:text-base sm:leading-7">
          {t(isMissingLocation ? "locationRequiredDescription" : isError ? "coverageErrorDescription" : "outsideAreaDescription")}
        </p>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <LocationTrigger actionLabel={t(isMissingLocation ? "selectLocation" : "changeLocation")} />
          {isError && onRetry ? (
            <button className="inline-flex min-h-11 items-center gap-2 rounded-full px-5 text-sm font-semibold text-brand transition-colors hover:bg-brand-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand" onClick={onRetry} type="button">
              <RefreshCw aria-hidden="true" className="size-4" />
              {t("retry")}
            </button>
          ) : null}
        </div>
      </div>
    </section>
  );
}
