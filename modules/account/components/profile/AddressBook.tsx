"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Icon } from "@/components/shared/brand/Icon";
import { LocationModal } from "@/modules/account/components/location/LocationModal";
import { SaveAddressModal } from "@/modules/account/components/location/SaveAddressModal";
import { ProfileSidebar } from "@/modules/account/components/profile/ProfileSidebar";
import { ProfileBackLink } from "@/modules/account/components/profile/ProfileBackLink";
import {
  useAddressesQuery,
  useDeleteAddressMutation,
  useSessionQuery,
} from "@/modules/account/queries/useAccountQueries";
import type {
  AddressType,
  ChosenPlace,
  SavedAddress,
} from "@/modules/account/types";

const TYPE_KEYS: Record<
  AddressType,
  "typeHome" | "typeOffice" | "typeApartment" | "typeOther"
> = {
  HOME: "typeHome",
  OFFICE: "typeOffice",
  APARTMENT: "typeApartment",
  OTHER: "typeOther",
};

const TYPE_ICONS: Record<AddressType, string> = {
  HOME: "/icons/home-icon.png",
  OFFICE: "/icons/work-icon.png",
  APARTMENT: "/icons/home-icon.png",
  OTHER: "/icons/others-icon.png",
};

function chosenPlaceFromAddress(address: SavedAddress): ChosenPlace | null {
  const [longitude, latitude] = address.location?.coordinates ?? [];
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;

  return {
    address: address.address,
    latitude,
    longitude,
    label: address.location_name || undefined,
  };
}

function AddressCard({
  address,
  onEdit,
  onRemove,
}: {
  address: SavedAddress;
  onEdit: () => void;
  onRemove: () => void;
}) {
  const t = useTranslations("addressBook");
  const typeLabel = t(TYPE_KEYS[address.type] ?? "typeOther");
  const name = address.location_name || typeLabel;
  const details = Object.values(address.additional_fields ?? {}).filter(Boolean);

  return (
    <article
      className={`group flex min-h-52 flex-col rounded-xl border shadow-[0_8px_28px_rgba(35,22,26,0.06)] transition-[border-color,transform,box-shadow] hover:-translate-y-0.5 hover:shadow-card ${
        address.is_selected
          ? "border-brand bg-brand text-ink"
          : "border-transparent bg-card"
      }`}
    >
      <div className="flex flex-1 flex-col px-5 pb-4 pt-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className={`grid size-8 flex-none place-items-center rounded-lg p-1.5 ${address.is_selected ? "bg-white" : "bg-brand/10"}`}>
              <Image
                src={TYPE_ICONS[address.type]}
                alt=""
                width={20}
                height={20}
                className="size-full object-contain"
              />
            </span>
            <h2 className="truncate text-[14px] font-semibold">{name}</h2>
          </div>
          {address.is_selected ? (
            <span className="flex-none rounded-full bg-white px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.06em] text-brand">
              {t("primary")}
            </span>
          ) : null}
        </div>

        <p className={`mt-4 text-[12px] leading-[1.65] ${address.is_selected ? "text-white/90" : "text-foreground"}`}>
          {address.address}
        </p>
        {details.length ? (
          <p className={`mt-2 line-clamp-2 text-[10px] leading-relaxed ${address.is_selected ? "text-white/70" : "text-body"}`}>
            {details.join(" · ")}
          </p>
        ) : null}
      </div>

      <footer className={`grid grid-cols-2 border-t ${address.is_selected ? "border-white/20" : "border-line"}`}>
        <button
          type="button"
          onClick={onEdit}
          disabled={!chosenPlaceFromAddress(address)}
          aria-label={t("editAddress", { name })}
          className={`inline-flex min-h-12 items-center justify-center gap-2 border-r text-[11px] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-45 ${address.is_selected ? "border-ink/20 text-ink hover:bg-white/20" : "border-line text-brand hover:bg-brand/10"}`}
        >
          <Pencil className="size-3.5" aria-hidden="true" />
          {t("edit")}
        </button>
        <button
          type="button"
          onClick={onRemove}
          aria-label={t("removeAddress", { name })}
          className={`inline-flex min-h-12 items-center justify-center gap-2 text-[11px] font-semibold transition-colors ${address.is_selected ? "text-ink hover:bg-white/20" : "text-brand hover:bg-brand/10"}`}
        >
          <Trash2 className="size-3.5" aria-hidden="true" />
          {t("remove")}
        </button>
      </footer>
    </article>
  );
}

function RemoveAddressDialog({
  address,
  onClose,
  onConfirm,
  isRemoving,
  error,
}: {
  address: SavedAddress;
  onClose: () => void;
  onConfirm: () => void;
  isRemoving: boolean;
  error: string;
}) {
  const t = useTranslations("addressBook");

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isRemoving) onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isRemoving, onClose]);

  return (
    <div
      className="fixed inset-0 z-[70] grid place-items-center bg-[rgba(20,10,14,0.58)] p-5"
      role="dialog"
      aria-modal="true"
      aria-labelledby="remove-address-title"
      onClick={(event) => {
        if (event.target === event.currentTarget && !isRemoving) onClose();
      }}
    >
      <div className="w-full max-w-sm rounded-2xl bg-card p-6 shadow-[0_24px_70px_rgba(20,10,14,0.3)]">
        <span className="grid size-11 place-items-center rounded-full bg-brand/10 text-brand">
          <Icon name="pin" className="size-5" />
        </span>
        <h2 id="remove-address-title" className="mt-4 text-lg font-semibold">
          {t("removeTitle")}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-body">
          {t("removeDescription")}
        </p>
        <p className="mt-3 rounded-xl bg-[var(--soft-surface)] px-4 py-3 text-xs leading-relaxed">
          {address.address}
        </p>
        {error ? (
          <p role="alert" className="mt-3 text-xs text-brand">
            {error}
          </p>
        ) : null}
        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isRemoving}
            className="min-h-10 rounded-full px-4 text-xs font-semibold text-body hover:bg-[var(--soft-surface)] disabled:opacity-50"
          >
            {t("cancel")}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isRemoving}
            autoFocus
            className="min-h-10 rounded-full bg-brand px-5 text-xs font-semibold text-ink hover:bg-brand/85 disabled:cursor-wait disabled:opacity-60"
          >
            {isRemoving ? t("removing") : t("confirmRemove")}
          </button>
        </div>
      </div>
    </div>
  );
}

export function AddressBook() {
  const t = useTranslations("addressBook");
  const router = useRouter();
  const session = useSessionQuery();
  const authenticated = session.data?.authenticated === true;
  const addresses = useAddressesQuery(authenticated);
  const deleteAddress = useDeleteAddressMutation();
  const [isAdding, setIsAdding] = useState(false);
  const [addressToEdit, setAddressToEdit] = useState<SavedAddress | null>(null);
  const [addressToRemove, setAddressToRemove] = useState<SavedAddress | null>(null);
  const [removeError, setRemoveError] = useState("");

  useEffect(() => {
    if (!session.isPending && !authenticated) router.replace("/login");
  }, [authenticated, router, session.isPending]);

  const editPlace = addressToEdit
    ? chosenPlaceFromAddress(addressToEdit)
    : null;

  const remove = async () => {
    if (!addressToRemove) return;
    setRemoveError("");
    try {
      await deleteAddress.mutateAsync(addressToRemove.id);
      setAddressToRemove(null);
    } catch {
      setRemoveError(t("removeError"));
    }
  };

  return (
    <main className="min-h-[calc(100svh-4rem)] bg-background text-foreground md:min-h-[calc(100svh-4.75rem)] min-[700px]:grid min-[700px]:grid-cols-[240px_1fr] min-[1100px]:h-[calc(100svh-4.75rem)] min-[1100px]:overflow-hidden">
      <ProfileSidebar />
      <div className="min-w-0 min-[1100px]:overflow-y-auto">
        <div className="mx-auto w-full max-w-[1400px] px-5 py-7 sm:px-8 sm:py-10">
          <header className="mb-7">
            <ProfileBackLink />
            <h1 className="text-[25px] font-semibold tracking-[-0.025em] sm:text-[29px]">
              {t("title")}
            </h1>
            <p className="mt-1 text-[12px] text-body">{t("subtitle")}</p>
          </header>

          {session.isPending || (authenticated && addresses.isPending) ? (
            <div className="grid min-h-64 place-items-center" role="status">
              <div className="flex items-center gap-3 text-sm font-medium text-muted">
                <span className="size-5 animate-spin rounded-full border-2 border-[#efc3ca] border-t-brand" />
                {t("loading")}
              </div>
            </div>
          ) : addresses.isError ? (
            <div role="alert" className="rounded-xl bg-card p-6 text-[13px] text-brand shadow-card">
              {t("loadError")}
            </div>
          ) : authenticated ? (
            <>
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                <button
                  type="button"
                  onClick={() => setIsAdding(true)}
                  className="group flex min-h-52 flex-col items-center justify-center rounded-xl border border-dashed border-brand bg-card px-6 text-center transition-[border-color,background-color,transform] hover:-translate-y-0.5 hover:bg-brand/10"
                >
                  <span className="grid size-10 place-items-center rounded-full bg-brand/10 text-brand transition-transform group-hover:scale-105">
                    <Icon name="pin" className="size-4" />
                  </span>
                  <strong className="mt-4 text-[13px] font-semibold">{t("addNew")}</strong>
                  <span className="mt-1 text-[10px] text-muted">{t("addDescription")}</span>
                </button>

                {(addresses.data ?? []).map((address) => (
                  <AddressCard
                    key={address.id}
                    address={address}
                    onEdit={() => setAddressToEdit(address)}
                    onRemove={() => {
                      setRemoveError("");
                      setAddressToRemove(address);
                    }}
                  />
                ))}
              </div>

              {!addresses.data?.length ? (
                <p className="mt-5 text-center text-xs text-muted">{t("empty")}</p>
              ) : null}
            </>
          ) : null}
        </div>
      </div>

      <LocationModal
        open={isAdding}
        onClose={() => setIsAdding(false)}
        canSaveAddress
        showSavedAddresses={false}
      />

      {addressToEdit && editPlace ? (
        <SaveAddressModal
          place={editPlace}
          addressToEdit={addressToEdit}
          onClose={() => setAddressToEdit(null)}
          onSaved={() => setAddressToEdit(null)}
        />
      ) : null}

      {addressToRemove ? (
        <RemoveAddressDialog
          address={addressToRemove}
          onClose={() => setAddressToRemove(null)}
          onConfirm={() => void remove()}
          isRemoving={deleteAddress.isPending}
          error={removeError}
        />
      ) : null}
    </main>
  );
}
