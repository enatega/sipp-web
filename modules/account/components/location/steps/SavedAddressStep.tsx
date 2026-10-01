"use client";

import { useTranslations } from "next-intl";
import type { SavedAddress } from "@/modules/account/types";
import { InteractiveLocationMap } from "@/modules/account/components/location/InteractiveLocationMap";
import { LocationAlert } from "@/modules/account/components/location/steps/LocationAlert";
import { LocationStepHeader } from "@/modules/account/components/location/steps/LocationStepHeader";
import { SavedAddressIcon } from "@/modules/account/components/location/steps/SavedAddressIcon";
import {
  PRIMARY_BUTTON,
  SECONDARY_BUTTON,
  SUMMARY_CARD,
} from "@/modules/account/components/location/steps/styles";

interface Props {
  address: SavedAddress;
  isSelecting: boolean;
  error: string;
  onDeliverHere: () => void;
  onEdit: () => void;
  onBack: () => void;
  onClose: () => void;
}

export function SavedAddressStep({
  address,
  isSelecting,
  error,
  onDeliverHere,
  onEdit,
  onBack,
  onClose,
}: Props) {
  const t = useTranslations("location");
  const [longitude, latitude] = address.location?.coordinates ?? [];
  const hasPoint = Number.isFinite(latitude) && Number.isFinite(longitude);

  return (
    <>
      <LocationStepHeader title={t("confirmTitle")} onBack={onBack} onClose={onClose} />

      <div className="flex-1 overflow-y-auto px-5 pb-6 sm:px-6">
        {hasPoint ? (
          <div className="mb-3">
            <InteractiveLocationMap
              latitude={latitude}
              longitude={longitude}
              ariaLabel={t("savedMapPreview")}
              isReadOnly
            />
          </div>
        ) : null}

        <div className={SUMMARY_CARD}>
          <SavedAddressIcon
            type={address.type}
            className="mt-0.5 size-4.5 flex-none text-brand"
          />
          <div className="min-w-0">
            <strong className="block text-sm font-medium capitalize text-ink">
              {address.location_name || address.type.toLowerCase()}
            </strong>
            <p className="mt-1 text-[13px] leading-relaxed text-muted">
              {address.address}
            </p>
          </div>
        </div>

        <LocationAlert message={error} />

        <button
          type="button"
          onClick={onDeliverHere}
          disabled={isSelecting}
          className={`${PRIMARY_BUTTON} mt-6`}
        >
          {t("deliverHere")}
        </button>
        <button type="button" onClick={onEdit} className={`${SECONDARY_BUTTON} mt-2.5`}>
          {t("editAddressAction")}
        </button>
      </div>
    </>
  );
}
