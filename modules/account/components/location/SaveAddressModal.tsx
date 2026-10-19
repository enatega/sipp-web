"use client";

import { ApiError } from "@/services/api/client";
import { useRef, useState } from "react";
import { locationApi } from "@/modules/account/api/location";
import { useFormik } from "formik";
import { useTranslations } from "next-intl";
import { useActionToast } from "@/components/shared/useActionToast";
import { InteractiveLocationMap } from "@/modules/account/components/location/InteractiveLocationMap";
import { MapThumb } from "@/modules/account/components/location/MapThumb";
import type { AddressType, ChosenPlace, SavedAddress } from "@/modules/account/types";
import { addressDetailsSchema } from "@/modules/account/schemas/addressSchema";
import { useSaveAddressMutation } from "@/modules/account/queries/useAccountQueries";
import { buildAddressPayload } from "@/modules/account/utils/addressPayload";

import { AddressSaveFields } from "./steps/AddressSaveFields";

type SaveAddressModalProps = {
  place: ChosenPlace;
  onClose: () => void;
  onSaved: (address: SavedAddress) => void;
  addressToEdit?: SavedAddress | null;
};

export function SaveAddressModal({
  place: initialPlace,
  onClose,
  onSaved,
  addressToEdit,
}: SaveAddressModalProps) {
  const t = useTranslations("saveAddress");
  const [reloadedPlace, setReloadedPlace] = useState<ChosenPlace | null>(null);
  const place = reloadedPlace ?? initialPlace;
  const [isEditingLocation, setIsEditingLocation] = useState(false);
  const [isResolvingLocation, setIsResolvingLocation] = useState(false);
  const mapRequest = useRef(0);
  const saveAddress = useSaveAddressMutation();
  const notify = useActionToast();
  const details = addressToEdit?.addressDetails;
  const [expectedUpdatedAt, setExpectedUpdatedAt] = useState(addressToEdit?.updatedAt);
  const formik = useFormik({
    initialValues: {
      type: (addressToEdit?.type ?? "HOME") as AddressType,
      placeName: details?.placeName ?? "",
      howToFindYou: details?.howToFindYou ?? "",
      deliveryInstructions: details?.deliveryInstructions ?? "",
    },
    validationSchema: addressDetailsSchema(t),
    onSubmit: async (values, helpers) => {
      if (isResolvingLocation) return;
      helpers.setStatus(undefined);
      try {
        const savedAddress = await saveAddress.mutateAsync({
          id: addressToEdit?.id,
          payload: buildAddressPayload(place, values, expectedUpdatedAt),
        });
        onSaved(savedAddress);
      } catch (caught) {
        notify.error(caught, "addressSaveFailed");
        helpers.setStatus(t(caught instanceof ApiError && caught.code === "ADDRESS_EDIT_CONFLICT" ? "editConflict" : caught instanceof ApiError && caught.code === "ADDRESS_APP_UPDATE_REQUIRED" ? "updateRequired" : "saveRetry"));
      }
    },
  });

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-[rgba(20,10,14,0.55)] sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="save-address-title"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <form
        onSubmit={formik.handleSubmit}
        className="flex max-h-[92svh] w-full flex-col overflow-hidden rounded-t-2xl bg-card shadow-[0_24px_70px_rgba(20,10,14,0.3)] sm:max-w-[440px] sm:rounded-2xl"
      >
        <header className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 id="save-address-title" className="text-base font-bold text-ink">
            {addressToEdit ? t("editTitle") : t("title")}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={t("close")}
            className="grid size-7 place-items-center rounded-full border border-[#e6e8ec] text-[#8a8d94] hover:text-ink"
          >
            <svg
              viewBox="0 0 20 20"
              aria-hidden="true"
              className="w-3 fill-none stroke-current stroke-[2] [stroke-linecap:round]"
            >
              <path d="m5 5 10 10M15 5 5 15" />
            </svg>
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          <div className="flex items-center gap-3 rounded-xl border border-[#eceef1] p-2.5">
            <MapThumb
              latitude={place.latitude}
              longitude={place.longitude}
              zoom={16}
              className="size-11 flex-none rounded-lg"
              pinClassName="w-[42%]"
            />
            <span className="min-w-0 flex-1">
              <b className="block truncate text-sm font-semibold text-ink">
                {place.label ?? place.address.split(",")[0]}
              </b>
              <small className="block truncate text-xs text-[#8a8d94]">
                {place.address}
              </small>
            </span>
            <button
              type="button"
              onClick={() => setIsEditingLocation(value => !value)}
              disabled={formik.isSubmitting}
              className="h-8 flex-none rounded-full bg-brand px-4 text-xs font-semibold text-ink"
            >
              {t("edit")}
            </button>
          </div>

          {isEditingLocation ? <InteractiveLocationMap latitude={place.latitude} longitude={place.longitude} ariaLabel={t("edit")} onSelect={async (latitude, longitude) => {
            if (formik.isSubmitting) return;
            const request = ++mapRequest.current;
            setIsResolvingLocation(true);
            try {
              const result = await locationApi.addressFromPoint(latitude, longitude);
              if (request === mapRequest.current) setReloadedPlace({ ...place, address: result.address, latitude, longitude });
            } catch { if (request === mapRequest.current) formik.setStatus(t("saveRetry")); }
            finally { if (request === mapRequest.current) setIsResolvingLocation(false); }
          }} /> : null}
          <AddressSaveFields values={formik.values} onChange={formik.handleChange} onBlur={formik.handleBlur} onTypeChange={type => void formik.setFieldValue("type", type)} isDisabled={formik.isSubmitting} errors={formik.submitCount ? formik.errors : {}} />
          {formik.status ? <p role="alert" className="mt-3 text-sm text-danger">{formik.status}</p> : null}
        {formik.status && addressToEdit ? <button type="button" disabled={formik.isSubmitting} className="mt-3 min-h-11 text-sm font-semibold" onClick={async () => {
          try {
            const latest = await locationApi.getAddress(addressToEdit.id);
            setExpectedUpdatedAt(latest.updatedAt);
            setReloadedPlace({ address: latest.address, latitude: latest.location.coordinates[1], longitude: latest.location.coordinates[0], savedAddressId: latest.id, addressDetails: latest.addressDetails });
            formik.resetForm({ values: { ...formik.values, type: latest.type, placeName: latest.addressDetails?.placeName ?? "", howToFindYou: latest.addressDetails?.howToFindYou ?? "", deliveryInstructions: latest.addressDetails?.deliveryInstructions ?? "" } });
          } catch { formik.setStatus(t("saveRetry")); }
        }}>{t("reload")}</button> : null}


        </div>

        <footer className="border-t border-line px-5 py-4">
          <button
            type="submit"
            disabled={formik.isSubmitting || isResolvingLocation}
            className="h-12 w-full rounded-lg bg-brand text-sm font-semibold text-ink transition-colors hover:bg-brand/85 disabled:cursor-wait disabled:opacity-70"
          >
            {formik.isSubmitting
              ? addressToEdit
                ? t("updating")
                : t("saving")
              : addressToEdit
                ? t("update")
                : t("save")}
          </button>
        </footer>
      </form>
    </div>
  );
}
