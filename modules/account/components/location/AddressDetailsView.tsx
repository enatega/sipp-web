"use client";
import { useTranslations } from "next-intl";
import type { AddressDetails } from "../../types/location";
interface Props { isHistoricalFallback?: boolean; details?: AddressDetails | null; legacyText?: string | null; compact?: boolean }
export function AddressDetailsView({ details, legacyText, compact = false, isHistoricalFallback = false }: Props) {
  const t = useTranslations("saveAddress");
  const values = (["placeName", "howToFindYou", "deliveryInstructions"] as const).filter(key => details?.[key]?.trim());
  if (!values.length && !legacyText?.trim() && !isHistoricalFallback) return null;
  const content = <dl className="mt-2 space-y-2 text-sm">{isHistoricalFallback ? <div><dt className="sr-only">{t("legacyDetails")}</dt><dd>{t("historicalFallback")}</dd></div> : null}{values.map(key => <div key={key}><dt className="font-medium">{t(`${key}Heading`)}</dt><dd className="whitespace-pre-wrap break-words">{details?.[key]}</dd></div>)}{!details && legacyText ? <div><dt className="font-medium">{t("legacyDetails")}</dt><dd className="whitespace-pre-wrap break-words">{legacyText}</dd></div> : null}</dl>;
  return compact ? <details className="mt-2"><summary className="cursor-pointer text-sm font-medium">{t("showDetails")}</summary>{content}</details> : content;
}
