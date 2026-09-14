"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { storePlace } from "@/modules/account/api/location";
import type {
  ChosenPlace,
  Prediction,
  SavedAddress,
} from "@/modules/account/types";
import { InteractiveLocationMap } from "@/modules/account/components/location/InteractiveLocationMap";
import { SaveAddressModal } from "@/modules/account/components/location/SaveAddressModal";
import {
  useAddressesQuery,
  usePlaceSearchQuery,
  usePlaceDetailsMutation,
  useReverseGeocodeMutation,
  useSelectAddressMutation,
} from "@/modules/account/queries/useAccountQueries";

type LocationModalProps = {
  open: boolean;
  onClose: () => void;
  /** Signed-in visitors get the save-address step; guests just pick a place. */
  canSaveAddress: boolean;
  showSavedAddresses?: boolean;
};

const SECTION_LABEL =
  "text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9a9da4]";

function pinIcon(className: string) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={`${className} fill-none stroke-current`}
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

export function LocationModal({
  open,
  onClose,
  canSaveAddress,
  showSavedAddresses = true,
}: LocationModalProps) {
  const t = useTranslations("location");
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [chosen, setChosen] = useState<ChosenPlace | null>(null);
  const [busy, setBusy] = useState<"locate" | "resolve" | null>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [addressToEdit, setAddressToEdit] = useState<SavedAddress | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const mapSelectionRef = useRef(0);
  const addressesQuery = useAddressesQuery(open && canSaveAddress);
  const searchQuery = usePlaceSearchQuery(debouncedQuery, open);
  const selectAddress = useSelectAddressMutation();
  const placeDetails = usePlaceDetailsMutation();
  const reverseGeocode = useReverseGeocodeMutation();
  const savedAddresses = addressesQuery.data ?? [];

  useEffect(() => {
    if (!open) return;
    searchRef.current?.focus();
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", escape);
    return () => window.removeEventListener("keydown", escape);
  }, [open, onClose]);

  // Debounced autocomplete against the platform's Places proxy.
  useEffect(() => {
    const term = query.trim();
    const timer = window.setTimeout(
      () => setDebouncedQuery(term.length >= 3 ? term : ""),
      term.length >= 3 ? 350 : 0,
    );

    return () => {
      window.clearTimeout(timer);
    };
  }, [query]);

  const useCurrentLocation = async () => {
    setError("");

    if (!("geolocation" in navigator)) {
      setError(t("geolocationUnsupported"));
      return;
    }

    // Check first so a previously blocked site gets an explanation rather
    // than a prompt the browser will never show again.
    if (navigator.permissions) {
      try {
        const status = await navigator.permissions.query({
          name: "geolocation" as PermissionName,
        });
        if (status.state === "denied") {
          setError(t("permissionBlocked"));
          return;
        }
      } catch {
        // Permissions API is optional; fall through to the prompt.
      }
    }

    setBusy("locate");
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const { address } = await reverseGeocode.mutateAsync({
            lat: coords.latitude,
            lng: coords.longitude,
          });
          setChosen({
            address,
            latitude: coords.latitude,
            longitude: coords.longitude,
          });
          setQuery("");
        } catch (caught) {
          setError(
            caught instanceof Error
              ? caught.message
              : t("reverseError"),
          );
        } finally {
          setBusy(null);
        }
      },
      (positionError) => {
        setBusy(null);
        setError(
          positionError.code === positionError.PERMISSION_DENIED
            ? t("permissionDeclined")
            : positionError.code === positionError.TIMEOUT
              ? t("geolocationTimeout")
              : t("geolocationError"),
        );
      },
      { enableHighAccuracy: true, timeout: 12_000, maximumAge: 60_000 },
    );
  };

  const pickPrediction = async (prediction: Prediction) => {
    setBusy("resolve");
    setError("");
    try {
      const point = await placeDetails.mutateAsync(prediction.place_id);
      setChosen({
        address: prediction.description,
        latitude: point.lat,
        longitude: point.lng,
        label: prediction.structured_formatting?.main_text,
      });
      setQuery("");
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : t("placeError"),
      );
    } finally {
      setBusy(null);
    }
  };

  const confirm = () => {
    if (!chosen) return;
    storePlace(chosen);
    if (canSaveAddress) {
      setSaving(true);
      return;
    }
    onClose();
  };

  const pickMapPoint = async (latitude: number, longitude: number) => {
    const selection = ++mapSelectionRef.current;
    setBusy("resolve");
    setError("");
    try {
      const { address } = await reverseGeocode.mutateAsync({
        lat: latitude,
        lng: longitude,
      });
      if (selection !== mapSelectionRef.current) return;
      setChosen({ address, latitude, longitude });
      setQuery("");
    } catch (caught) {
      if (selection === mapSelectionRef.current) {
        setError(caught instanceof Error ? caught.message : t("reverseError"));
      }
    } finally {
      if (selection === mapSelectionRef.current) setBusy(null);
    }
  };

  const placeFromAddress = (address: SavedAddress): ChosenPlace | null => {
    const [longitude, latitude] = address.location?.coordinates ?? [];
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      setError(t("missingMapLocation"));
      return null;
    }
    return {
      address: address.address,
      latitude,
      longitude,
      label: address.location_name || address.type.toLowerCase(),
      savedAddressId: address.id,
    };
  };

  const selectSavedAddress = async (address: SavedAddress) => {
    const place = placeFromAddress(address);
    if (!place) return;
    setBusy("resolve");
    setError("");
    try {
      await selectAddress.mutateAsync(address.id);
      storePlace(place);
      onClose();
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : t("selectError"),
      );
    } finally {
      setBusy(null);
    }
  };

  const editSavedAddress = (address: SavedAddress) => {
    const place = placeFromAddress(address);
    if (!place) return;
    setChosen(place);
    setAddressToEdit(address);
    setSaving(true);
  };

  const reset = () => {
    mapSelectionRef.current += 1;
    setChosen(null);
    setAddressToEdit(null);
    setQuery("");
    setError("");
  };

  // Predictions are only meaningful for the term that fetched them, so the
  // visible list is derived rather than cleared when the query shortens.
  const visiblePredictions =
    query.trim() === debouncedQuery ? (searchQuery.data ?? []).slice(0, 6) : [];
  const currentBusy = busy ?? (searchQuery.isFetching ? "search" : null);
  const remoteError =
    addressesQuery.error instanceof Error
      ? addressesQuery.error.message
      : searchQuery.error instanceof Error
        ? searchQuery.error.message
        : "";
  const displayedError = error || remoteError;

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-end justify-center bg-[rgba(20,10,14,0.55)] p-0 sm:items-center sm:p-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="location-modal-title"
        onClick={(event) => {
          if (event.target === event.currentTarget) onClose();
        }}
      >
        <div className="flex max-h-[92svh] w-full flex-col overflow-hidden rounded-t-2xl bg-card shadow-[0_24px_70px_rgba(20,10,14,0.3)] sm:max-w-[440px] sm:rounded-2xl">
          <header className="flex items-center justify-between border-b border-line px-5 py-4">
            <h2 id="location-modal-title" className="text-base font-bold text-ink">
              {t("title")}
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

          <div className="flex-1 overflow-y-auto px-5 pb-4 pt-4">
            <label className="flex h-11 items-center gap-2.5 rounded-lg bg-[var(--soft-surface)] px-3.5">
              <svg
                viewBox="0 0 20 20"
                aria-hidden="true"
                className="w-4 flex-none fill-none stroke-[#9a9da4] stroke-[1.8] [stroke-linecap:round]"
              >
                <circle cx="9" cy="9" r="6" />
                <path d="m13.5 13.5 3 3" />
              </svg>
              <input
                ref={searchRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t("search")}
                aria-label={t("search")}
                className="w-full border-0 bg-transparent text-sm text-ink outline-none placeholder:text-[#9a9da4]"
              />
            </label>

            <button
              type="button"
              onClick={useCurrentLocation}
              disabled={currentBusy === "locate"}
              className="mt-3 flex w-full items-center gap-3 rounded-xl border border-[#f6dfe3] bg-[#fff5f6] px-3.5 py-3 text-left disabled:opacity-70"
            >
              <span className="grid size-9 flex-none place-items-center rounded-full bg-[#fbe3e7] text-brand">
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  className="w-4 fill-none stroke-current stroke-[1.8] [stroke-linecap:round]"
                >
                  <circle cx="12" cy="12" r="7" />
                  <circle cx="12" cy="12" r="2.4" />
                  <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
                </svg>
              </span>
              <span className="min-w-0">
                <b className="block text-sm font-semibold text-ink">
                  {currentBusy === "locate" ? t("findingYou") : t("current")}
                </b>
                <small className="block text-xs text-[#8a8d94]">
                  {t("currentDescription")}
                </small>
              </span>
            </button>

            {displayedError ? (
              <p
                role="alert"
                className="mt-3 rounded-lg bg-[#fff0f2] px-3.5 py-2.5 text-xs leading-relaxed text-[#9d1429]"
              >
                {displayedError}
              </p>
            ) : null}

            {!chosen && !query.trim() && canSaveAddress && showSavedAddresses ? (
              <section className="mt-5" aria-labelledby="saved-addresses-title">
                <div className="flex items-center justify-between">
                  <p id="saved-addresses-title" className={SECTION_LABEL}>
                    {t("saved")}
                  </p>
                  {savedAddresses.length ? (
                    <span className="text-[11px] text-[#9a9da4]">
                      {t("savedCount", { count: savedAddresses.length })}
                    </span>
                  ) : null}
                </div>

                {addressesQuery.isPending ? (
                  <div className="mt-2 space-y-2" aria-label={t("loadingSaved")}> 
                    {[0, 1].map((item) => (
                      <div
                        key={item}
                        className="h-[68px] animate-pulse rounded-xl bg-[#f4f6f9]"
                      />
                    ))}
                  </div>
                ) : savedAddresses.length ? (
                  <ul className="mt-2 space-y-2">
                    {savedAddresses.map((address) => (
                      <li key={address.id}>
                        <div
                          className={`flex w-full items-center rounded-xl border transition-colors hover:border-[#efbcc4] hover:bg-[#fffafa] ${
                            address.is_selected
                              ? "border-[#efbcc4] bg-[#fff7f8]"
                              : "border-line bg-card"
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => selectSavedAddress(address)}
                            disabled={currentBusy === "resolve"}
                            className="flex min-w-0 flex-1 items-center gap-3 px-3.5 py-3 text-left"
                          >
                            <span className="grid size-9 flex-none place-items-center rounded-full bg-[#fbe3e7] text-brand">
                              {pinIcon("w-4")}
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="flex items-center gap-2">
                                <b className="truncate text-sm font-semibold capitalize text-ink">
                                  {address.location_name ||
                                    address.type.toLowerCase()}
                                </b>
                                {address.is_selected ? (
                                  <small className="rounded-full bg-[#f8dfe3] px-2 py-0.5 text-[10px] font-semibold text-brand">
                                    {t("selected")}
                                  </small>
                                ) : null}
                              </span>
                              <small className="mt-0.5 block truncate text-xs text-[#8a8d94]">
                                {address.address}
                              </small>
                            </span>
                          </button>
                          <button
                            type="button"
                            onClick={() => editSavedAddress(address)}
                            className="mr-2 flex-none rounded-md px-2 py-1 text-xs font-semibold text-brand outline-none hover:bg-[#fbe3e7] focus-visible:ring-2 focus-visible:ring-brand"
                            aria-label={t("editAddress", {
                              name: address.location_name || address.type.toLowerCase(),
                            })}
                          >
                            {t("edit")}
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 rounded-xl border border-dashed border-[#e1e3e7] px-4 py-3 text-xs leading-relaxed text-[#8a8d94]">
                    {t("noSavedAddresses")}
                  </p>
                )}
              </section>
            ) : null}

            <div className="mt-4">
              <InteractiveLocationMap
                latitude={chosen?.latitude}
                longitude={chosen?.longitude}
                onSelect={(latitude, longitude) =>
                  void pickMapPoint(latitude, longitude)
                }
                onInitialLocation={(latitude, longitude) => {
                  if (!chosen) void pickMapPoint(latitude, longitude);
                }}
                ariaLabel={t("interactiveMap")}
              />
              <p className="mt-2 text-[10px] leading-relaxed text-muted">
                {t("mapInstruction")}
              </p>
            </div>

            {chosen ? (
              <>
                <p className={`${SECTION_LABEL} mt-4`}>{t("selectedLocation")}</p>
                <div className="mt-2 flex items-start gap-2.5 border-t border-[#f0f1f4] pt-3">
                  <span className="mt-0.5 text-brand">{pinIcon("w-4")}</span>
                  <span className="min-w-0">
                    <b className="block text-sm font-semibold text-ink">
                      {chosen.label ?? chosen.address.split(",")[0]}
                    </b>
                    <small className="block text-xs text-[#8a8d94]">
                      {chosen.address}
                    </small>
                  </span>
                </div>
              </>
            ) : visiblePredictions.length ? (
              <>
                <p className={`${SECTION_LABEL} mt-4`}>{t("nearbyAreas")}</p>
                <ul className="mt-1">
                  {visiblePredictions.map((prediction) => (
                    <li key={prediction.place_id}>
                      <button
                        type="button"
                        onClick={() => pickPrediction(prediction)}
                        disabled={currentBusy === "resolve"}
                        className="flex w-full items-start gap-2.5 border-b border-[#f4f5f7] py-3 text-left disabled:opacity-60"
                      >
                        <span className="mt-0.5 text-[#9a9da4]">
                          {pinIcon("w-4")}
                        </span>
                        <span className="min-w-0">
                          <b className="block truncate text-sm font-medium text-ink">
                            {prediction.structured_formatting?.main_text ??
                              prediction.description}
                          </b>
                          <small className="block truncate text-xs text-[#8a8d94]">
                            {prediction.structured_formatting?.secondary_text ??
                              prediction.description}
                          </small>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            ) : showSavedAddresses && savedAddresses.length && !query.trim() ? null : (
              <div className="grid place-items-center py-6">
                <Image
                  src="/images/maps.png"
                  alt=""
                  width={2000}
                  height={1400}
                  className="h-auto w-[min(70%,220px)]"
                />
                {currentBusy === "search" ? (
                  <p className="mt-2 text-xs text-[#8a8d94]">{t("searching")}</p>
                ) : query.trim().length > 0 && query.trim().length < 3 ? (
                  <p className="mt-2 text-xs text-[#8a8d94]">
                  {t("keepTyping")}
                  </p>
                ) : null}
              </div>
            )}
          </div>

          {chosen ? (
            <footer className="flex gap-2 border-t border-line px-5 py-4">
              <button
                type="button"
                onClick={reset}
                className="h-12 rounded-lg border border-[#e6e8ec] px-4 text-sm font-semibold text-[#55585f]"
              >
                {t("change")}
              </button>
              <button
                type="button"
                onClick={confirm}
                disabled={currentBusy === "resolve"}
                className="h-12 flex-1 rounded-lg bg-brand text-sm font-semibold text-white transition-colors hover:bg-brand-deep"
              >
                {t("confirm")}
              </button>
            </footer>
          ) : null}
        </div>
      </div>

      {saving && chosen ? (
        <SaveAddressModal
          place={chosen}
          addressToEdit={addressToEdit}
          onClose={() => {
            setSaving(false);
            setAddressToEdit(null);
          }}
          onSaved={(savedAddress) => {
            setSaving(false);
            setAddressToEdit(null);
            storePlace({ ...chosen, savedAddressId: savedAddress.id });
            onClose();
          }}
        />
      ) : null}
    </>
  );
}
