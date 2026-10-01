"use client";

import type { ChangeEvent } from "react";
import { useTranslations } from "next-intl";
import type { AddressType } from "@/modules/account/types";
import {
  FIELD_INPUT,
  FIELD_LABEL,
} from "@/modules/account/components/location/steps/styles";

export type AddressSaveValues = {
  type: AddressType;
  locationName: string;
  houseNo: string;
  building: string;
  landmark: string;
};

interface Props {
  values: AddressSaveValues;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onTypeChange: (type: AddressType) => void;
  isDisabled: boolean;
}

/** "Work" maps to the platform's OFFICE enum; APARTMENT is not offered. */
const TYPE_CHOICES: Array<{ key: "home" | "office" | "other"; value: AddressType }> = [
  { key: "home", value: "HOME" },
  { key: "office", value: "OFFICE" },
  { key: "other", value: "OTHER" },
];

export function AddressSaveFields({ values, onChange, onTypeChange, isDisabled }: Props) {
  const t = useTranslations("saveAddress");

  return (
    <>
      <div className="mt-3 flex gap-2" role="group" aria-label={t("saveAs")}>
        {TYPE_CHOICES.map((choice) => {
          const isActive = values.type === choice.value;
          return (
            <button
              key={choice.value}
              type="button"
              onClick={() => onTypeChange(choice.value)}
              aria-pressed={isActive}
              disabled={isDisabled}
              className={`min-h-11 flex-1 rounded-lg border px-2 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-brand ${
                isActive
                  ? "border-brand bg-brand-soft text-brand"
                  : "border-line bg-transparent text-ink hover:bg-soft-surface"
              }`}
            >
              {t(choice.key)}
            </button>
          );
        })}
      </div>

      {values.type === "OTHER" ? (
        <label className={FIELD_LABEL}>
          {t("nameLabel")}
          <input
            className={FIELD_INPUT}
            name="locationName"
            value={values.locationName}
            onChange={onChange}
            placeholder={t("namePlaceholder")}
            maxLength={100}
            disabled={isDisabled}
          />
        </label>
      ) : null}

      <label className={FIELD_LABEL}>
        {t("houseLabel")}
        <input
          className={FIELD_INPUT}
          name="houseNo"
          value={values.houseNo}
          onChange={onChange}
          placeholder={t("housePlaceholder")}
          maxLength={100}
          disabled={isDisabled}
        />
      </label>
      <label className={FIELD_LABEL}>
        {t("buildingLabel")}
        <input
          className={FIELD_INPUT}
          name="building"
          value={values.building}
          onChange={onChange}
          placeholder={t("buildingPlaceholder")}
          maxLength={150}
          disabled={isDisabled}
        />
      </label>
      <label className={FIELD_LABEL}>
        {t("landmarkLabel")}
        <input
          className={FIELD_INPUT}
          name="landmark"
          value={values.landmark}
          onChange={onChange}
          placeholder={t("landmarkPlaceholder")}
          maxLength={255}
          disabled={isDisabled}
        />
      </label>
    </>
  );
}
