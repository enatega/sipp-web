"use client";

import { useFormik } from "formik";
import { useTranslations } from "next-intl";
import { useActionToast } from "@/components/shared/useActionToast";
import { MapThumb } from "@/modules/account/components/location/MapThumb";
import type { AddressType, ChosenPlace, SavedAddress } from "@/modules/account/types";
import { addressDetailsSchema } from "@/modules/account/schemas/addressSchema";
import { useSaveAddressMutation } from "@/modules/account/queries/useAccountQueries";

type SaveAddressModalProps = {
  place: ChosenPlace;
  onClose: () => void;
  onSaved: (address: SavedAddress) => void;
  addressToEdit?: SavedAddress | null;
};

/**
 * "Work" maps to the platform's OFFICE enum; APARTMENT exists upstream but
 * the design offers three choices, so it is not surfaced here.
 */
const TYPE_CHOICES: Array<{ label: string; value: AddressType }> = [
  { label: "Home", value: "HOME" },
  { label: "Work", value: "OFFICE" },
  { label: "Other", value: "OTHER" },
];

const FIELD =
  "h-12 w-full rounded-lg border border-brand bg-[var(--soft-surface)] px-3.5 text-sm text-ink outline-none transition-colors placeholder:text-muted focus:border-brand focus:bg-card";

const LABEL = "text-xs font-medium text-foreground";

export function SaveAddressModal({
  place,
  onClose,
  onSaved,
  addressToEdit,
}: SaveAddressModalProps) {
  const t = useTranslations("saveAddress");
  const saveAddress = useSaveAddressMutation();
  const notify = useActionToast();
  const details = addressToEdit?.additional_fields;
  const formik = useFormik({
    initialValues: {
      type: (addressToEdit?.type ?? "HOME") as AddressType,
      houseNo: details?.houseNo ?? "",
      building: details?.building ?? "",
      landmark: details?.landmark ?? "",
    },
    validationSchema: addressDetailsSchema,
    onSubmit: async (values) => {
      try {
      const payload = {
        address: place.address,
        latitude: place.latitude,
        longitude: place.longitude,
        type: values.type,
        ...(place.label ? { location_name: place.label } : {}),
        additional_fields: {
          ...(values.houseNo.trim() ? { houseNo: values.houseNo.trim() } : {}),
          ...(values.building.trim() ? { building: values.building.trim() } : {}),
          ...(values.landmark.trim() ? { landmark: values.landmark.trim() } : {}),
        },
      };
      const savedAddress = await saveAddress.mutateAsync({
        id: addressToEdit?.id,
        payload,
      });
      notify.success(addressToEdit ? "addressUpdated" : "addressAdded");
      onSaved(savedAddress);
      } catch (caught) {
        notify.error(caught, "addressSaveFailed");
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
              onClick={onClose}
              className="h-8 flex-none rounded-full bg-brand px-4 text-xs font-semibold text-ink"
            >
              {t("edit")}
            </button>
          </div>

          <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9a9da4]">
            {t("saveAs")}
          </p>
          <div className="mt-2 flex gap-2 border-b border-dashed border-[#e6e8ec] pb-4">
            {TYPE_CHOICES.map((choice) => (
              <button
                key={choice.value}
                type="button"
                onClick={() => void formik.setFieldValue("type", choice.value)}
                aria-pressed={formik.values.type === choice.value}
                className={`h-10 flex-1 rounded-lg border text-sm font-semibold transition-colors ${
                  formik.values.type === choice.value
                    ? "border-brand bg-brand/10 text-brand"
                    : "border-line bg-card text-body"
                }`}
              >
                {t(choice.value.toLowerCase() as "home" | "office" | "other")}
              </button>
            ))}
          </div>

          <div className="mt-4 flex flex-col gap-3">
            <label className="flex flex-col gap-1.5">
              <span className={LABEL}>{t("houseLabel")}</span>
              <input
                className={FIELD}
                name="houseNo"
                value={formik.values.houseNo}
                onChange={formik.handleChange}
                placeholder={t("housePlaceholder")}
                maxLength={100}
                disabled={formik.isSubmitting}
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className={LABEL}>{t("buildingLabel")}</span>
              <input
                className={FIELD}
                name="building"
                value={formik.values.building}
                onChange={formik.handleChange}
                placeholder={t("buildingPlaceholder")}
                maxLength={150}
                disabled={formik.isSubmitting}
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className={LABEL}>{t("landmarkLabel")}</span>
              <input
                className={FIELD}
                name="landmark"
                value={formik.values.landmark}
                onChange={formik.handleChange}
                placeholder={t("landmarkPlaceholder")}
                maxLength={255}
                disabled={formik.isSubmitting}
              />
            </label>
          </div>

        </div>

        <footer className="border-t border-line px-5 py-4">
          <button
            type="submit"
            disabled={formik.isSubmitting}
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
