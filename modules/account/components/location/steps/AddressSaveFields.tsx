"use client";

import { useId, type ChangeEvent, type FocusEvent } from "react";
import { useTranslations } from "next-intl";
import type { AddressType } from "@/modules/account/types";
import type { AddressFormValues } from "@/modules/account/utils/addressPayload";
import { FIELD_INPUT, FIELD_LABEL } from "./styles";

export type AddressSaveValues = AddressFormValues;
interface Props {
  values: AddressSaveValues;
  onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onBlur?: (event: FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onTypeChange: (type: AddressType) => void;
  isDisabled: boolean;
  errors?: Partial<Record<keyof AddressSaveValues, string>>;
  showType?: boolean;
}
export function AddressSaveFields({ values, onChange, onBlur, onTypeChange, isDisabled, errors, showType = true }: Props) {
  const t = useTranslations("saveAddress");
  const id = useId();
  return <>
    {showType ? <div className="mt-3 flex gap-2" role="group" aria-label={t("saveAs")}>
      {(["HOME", "OFFICE", "OTHER"] as const).map(type => <button key={type} type="button" aria-pressed={values.type === type} disabled={isDisabled} onClick={() => onTypeChange(type)} className={`min-h-11 flex-1 rounded-lg border px-2 text-sm focus-visible:ring-2 focus-visible:ring-brand ${values.type === type ? "border-brand bg-brand-soft text-brand" : "border-line text-ink"}`}>{t(type === "OFFICE" ? "work" : type.toLowerCase())}</button>)}
    </div> : null}
    {errors?.type ? <p role="alert" className="mt-2 text-sm text-danger">{errors.type}</p> : null}
    {(["placeName", "howToFindYou", "deliveryInstructions"] as const).map(key => <label key={key} className={FIELD_LABEL} htmlFor={`${id}-${key}`}>
      {t(`${key}Label`)}
      <textarea id={`${id}-${key}`} name={key} value={values[key]} onChange={onChange} onBlur={onBlur} rows={key === "placeName" ? 1 : 3} placeholder={t(`${key}Placeholder`)} disabled={isDisabled} aria-required={key === "howToFindYou"} aria-invalid={Boolean(errors?.[key])} aria-describedby={errors?.[key] ? `${id}-${key}-error` : undefined} className={`${FIELD_INPUT} h-auto min-h-12 resize-y py-3`} />
      {errors?.[key] ? <span id={`${id}-${key}-error`} role="alert" className="text-sm text-danger">{errors[key]}</span> : null}
    </label>)}
  </>;
}
