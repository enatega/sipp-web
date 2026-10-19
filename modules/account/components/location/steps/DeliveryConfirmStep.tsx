"use client";
import { ApiError } from "@/services/api/client";

import { useEffect, useState } from "react";
import { locationApi } from "@/modules/account/api/location";
import { useFormik } from "formik";
import { MapPin } from "lucide-react";
import { useTranslations } from "next-intl";
import { storePlace } from "@/modules/account/api/location";
import type { AddressType, ChosenPlace, SavedAddress } from "@/modules/account/types";
import { deliveryAddressSchema } from "@/modules/account/schemas/addressSchema";
import { useSaveAddressMutation } from "@/modules/account/queries/useAccountQueries";
import { buildAddressPayload } from "@/modules/account/utils/addressPayload";
import { InteractiveLocationMap } from "@/modules/account/components/location/InteractiveLocationMap";
import { AddressSaveFields } from "@/modules/account/components/location/steps/AddressSaveFields";
import { LocationAlert } from "@/modules/account/components/location/steps/LocationAlert";
import { LocationStepHeader } from "@/modules/account/components/location/steps/LocationStepHeader";
import { PRIMARY_BUTTON, SUMMARY_CARD } from "@/modules/account/components/location/steps/styles";

export type DeliveryAddressDraft = { type: AddressType; placeName: string; howToFindYou: string; deliveryInstructions: string; shouldSave: boolean };

interface Props {
  initialDraft?: DeliveryAddressDraft;
  onDraftChange?: (draft: DeliveryAddressDraft) => void;
  place: ChosenPlace;
  /** Signed-in visitors can save; guests only pick a place. */
  canSaveAddress: boolean;
  /** Address book and edit flows always save instead of offering a checkbox. */
  isSaveRequired: boolean;
  addressToEdit: SavedAddress | null;
  isResolving: boolean;
  error: string;
  onMapSelect: (latitude: number, longitude: number) => void;
  onDone: (didSave: boolean) => void;
  onBack: () => void;
  onClose: () => void;
}

export function DeliveryConfirmStep({
  initialDraft,
  onDraftChange,
  place: initialPlace,
  canSaveAddress,
  isSaveRequired,
  addressToEdit,
  isResolving,
  error,
  onMapSelect,
  onDone,
  onBack,
  onClose,
}: Props) {
  const t = useTranslations("location");
  const [reloadedPlace, setReloadedPlace] = useState<ChosenPlace | null>(null);
  const place = reloadedPlace ?? initialPlace;
  const tSave = useTranslations("saveAddress");
  const saveAddress = useSaveAddressMutation();
  const details = addressToEdit?.addressDetails;
  const [expectedUpdatedAt, setExpectedUpdatedAt] = useState(addressToEdit?.updatedAt);

  const formik = useFormik({
    initialValues: {
      shouldSave: isSaveRequired,
      type: (addressToEdit?.type ?? "HOME") as AddressType,
      placeName: details?.placeName ?? "",
      howToFindYou: details?.howToFindYou ?? "",
      deliveryInstructions: details?.deliveryInstructions ?? "",
      ...initialDraft,
    },
    validationSchema: deliveryAddressSchema(tSave),
    onSubmit: async (values, helpers) => {
      helpers.setStatus(undefined);
      if (!canSaveAddress || !values.shouldSave) {
        storePlace(place);
        onDone(false);
        return;
      }
      try {
        const savedAddress = await saveAddress.mutateAsync({
          id: addressToEdit?.id,
          payload: buildAddressPayload(place, values, expectedUpdatedAt),
        });
        storePlace({ ...place, label: savedAddress.location_name ?? undefined, savedAddressId: savedAddress.id, addressDetails: savedAddress.addressDetails });
        onDone(true);
      } catch (caught) {
        helpers.setStatus(tSave(caught instanceof ApiError && caught.code === "ADDRESS_EDIT_CONFLICT" ? "editConflict" : caught instanceof ApiError && caught.code === "ADDRESS_APP_UPDATE_REQUIRED" ? "updateRequired" : "saveRetry"));
      }
    },
  });

  useEffect(() => { onDraftChange?.(formik.values); }, [formik.values, onDraftChange]);

  const isSaving = canSaveAddress && formik.values.shouldSave;
  const submitLabel = formik.isSubmitting
    ? addressToEdit
      ? tSave("updating")
      : tSave("saving")
    : addressToEdit
      ? tSave("update")
      : isSaveRequired
        ? tSave("save")
        : isSaving
          ? t("saveAndDeliverHere")
          : t("deliverHere");

  return (
    <form onSubmit={formik.handleSubmit} className="flex min-h-0 flex-1 flex-col" noValidate>
      <LocationStepHeader
        title={addressToEdit ? tSave("editTitle") : t("confirmTitle")}
        onBack={onBack}
        onClose={onClose}
      />

      <div className="flex-1 overflow-y-auto px-5 pb-6 sm:px-6">
        <InteractiveLocationMap
          latitude={place.latitude}
          longitude={place.longitude}
          onSelect={(lat, lng) => { setReloadedPlace(null); onMapSelect(lat, lng); }}
          ariaLabel={t("interactiveMap")}
        />
        <p className="mb-4 mt-2 text-xs leading-relaxed text-muted">{t("mapInstruction")}</p>

        <div className={SUMMARY_CARD} aria-live="polite">
          <MapPin aria-hidden="true" className="mt-0.5 size-4.5 flex-none text-brand" />
          <div className="min-w-0">
            <strong className="block text-sm font-medium text-ink">
              {isResolving ? t("updatingAddress") : t("selectedLocation")}
            </strong>
            <p className="mt-1 text-[13px] leading-relaxed text-muted">{place.address}</p>
          </div>
        </div>

        {canSaveAddress && !isSaveRequired ? (
          <label className="mt-5 flex items-center gap-2.5 text-sm text-ink">
            <input
              type="checkbox"
              name="shouldSave"
              checked={formik.values.shouldSave}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              disabled={formik.isSubmitting}
              className="size-4.25 accent-brand"
            />
            {t("saveThisAddress")}
          </label>
        ) : null}

        {isSaving ? (
          <AddressSaveFields
            values={formik.values}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            errors={formik.submitCount ? formik.errors : {}}
            onTypeChange={(type) => void formik.setFieldValue("type", type)}
            isDisabled={formik.isSubmitting}
          />
        ) : null}

        <LocationAlert message={formik.status ?? error} />
        {formik.status && addressToEdit ? <button type="button" disabled={formik.isSubmitting} className="mt-3 min-h-11 text-sm font-semibold" onClick={async () => {
          try {
            const latest = await locationApi.getAddress(addressToEdit.id);
            setExpectedUpdatedAt(latest.updatedAt);
            setReloadedPlace({ address: latest.address, latitude: latest.location.coordinates[1], longitude: latest.location.coordinates[0], savedAddressId: latest.id, addressDetails: latest.addressDetails });
            formik.resetForm({ values: { ...formik.values, type: latest.type, placeName: latest.addressDetails?.placeName ?? "", howToFindYou: latest.addressDetails?.howToFindYou ?? "", deliveryInstructions: latest.addressDetails?.deliveryInstructions ?? "" } });
          } catch { formik.setStatus(tSave("saveRetry")); }
        }}>{tSave("reload")}</button> : null}


        <button
          type="submit"
          disabled={formik.isSubmitting || isResolving}
          className={`${PRIMARY_BUTTON} mt-6`}
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
