"use client";

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

interface Props {
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
  place,
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
  const tSave = useTranslations("saveAddress");
  const saveAddress = useSaveAddressMutation();
  const details = addressToEdit?.additional_fields;

  const formik = useFormik({
    initialValues: {
      shouldSave: isSaveRequired,
      type: (addressToEdit?.type ?? "HOME") as AddressType,
      locationName:
        addressToEdit?.type === "OTHER" ? (addressToEdit.location_name ?? "") : "",
      houseNo: details?.houseNo ?? "",
      building: details?.building ?? "",
      landmark: details?.landmark ?? "",
    },
    validationSchema: deliveryAddressSchema,
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
          payload: buildAddressPayload(place, values),
        });
        storePlace({ ...place, savedAddressId: savedAddress.id });
        onDone(true);
      } catch (caught) {
        helpers.setStatus(caught instanceof Error ? caught.message : tSave("saveError"));
      }
    },
  });

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
          onSelect={onMapSelect}
          onInitialLocation={() => undefined}
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
            onTypeChange={(type) => void formik.setFieldValue("type", type)}
            isDisabled={formik.isSubmitting}
          />
        ) : null}

        <LocationAlert message={formik.status ?? error} />

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
