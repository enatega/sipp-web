"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { storePlace } from "@/modules/account/api/location";
import type { PopularCity } from "@/modules/account/data/popularCities";
import type {
  ChosenPlace,
  Prediction,
  SavedAddress,
} from "@/modules/account/types";
import {
  useAddressesQuery,
  usePlaceSearchQuery,
  usePlaceDetailsMutation,
  useReverseGeocodeMutation,
  useSelectAddressMutation,
} from "@/modules/account/queries/useAccountQueries";
import { CurrentLocationStep } from "@/modules/account/components/location/steps/CurrentLocationStep";
import { DeliveryConfirmStep } from "@/modules/account/components/location/steps/DeliveryConfirmStep";
import { LocationDoneStep } from "@/modules/account/components/location/steps/LocationDoneStep";
import {
  LocationSearchStep,
  type SearchStatus,
} from "@/modules/account/components/location/steps/LocationSearchStep";
import { SavedAddressStep } from "@/modules/account/components/location/steps/SavedAddressStep";

type LocationModalProps = {
  open: boolean;
  onClose: () => void;
  /** Signed-in visitors can save the picked place; guests just pick a place. */
  canSaveAddress: boolean;
  /**
   * Address book mode: hides saved addresses and always saves the picked
   * place instead of offering an optional "Save this address" checkbox.
   */
  showSavedAddresses?: boolean;
};

/**
 * Routes where picking a delivery place should update the page in place
 * (it listens for the stored-place change) instead of going to discovery.
 */
const STAY_ON_ROUTES = ["/checkout"];

function shouldStayOnRoute(pathname: string) {
  return STAY_ON_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

type Step =
  | { name: "search" }
  | { name: "current" }
  | { name: "confirm" }
  | { name: "saved"; address: SavedAddress }
  | { name: "done"; didSave: boolean };

export function LocationModal({
  open,
  onClose,
  canSaveAddress,
  showSavedAddresses = true,
}: LocationModalProps) {
  const t = useTranslations("location");
  const router = useRouter();
  const pathname = usePathname();
  const [step, setStep] = useState<Step>({ name: "search" });
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [chosen, setChosen] = useState<ChosenPlace | null>(null);
  const [busy, setBusy] = useState<"locate" | "address" | "resolve" | null>(null);
  const [error, setError] = useState("");
  const [addressToEdit, setAddressToEdit] = useState<SavedAddress | null>(null);
  const mapSelectionRef = useRef(0);
  const locationRequestRef = useRef(0);
  const isLocatingRef = useRef(false);
  const addressesQuery = useAddressesQuery(open && canSaveAddress);
  const searchQuery = usePlaceSearchQuery(debouncedQuery, open);
  const selectAddress = useSelectAddressMutation();
  const placeDetails = usePlaceDetailsMutation();
  const reverseGeocode = useReverseGeocodeMutation();
  const savedAddresses = addressesQuery.data ?? [];
  const selectedSavedAddress = savedAddresses.find((address) => address.is_selected);
  const isAddressBookMode = !showSavedAddresses;

  const backToSearch = () => {
    mapSelectionRef.current += 1;
    locationRequestRef.current += 1;
    isLocatingRef.current = false;
    setStep({ name: "search" });
    setChosen(null);
    setAddressToEdit(null);
    setQuery("");
    setError("");
    setBusy(null);
  };

  const close = () => {
    backToSearch();
    onClose();
  };

  /** A delivery place was chosen: take the visitor to discovery for it. */
  const deliverHere = () => {
    close();
    if (!shouldStayOnRoute(pathname)) router.push("/discovery");
  };

  // Keep the latest close handler for the window-level Escape listener.
  const closeRef = useRef(close);
  useEffect(() => {
    closeRef.current = close;
  });

  useEffect(() => {
    if (!open) return;
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeRef.current();
    };
    window.addEventListener("keydown", escape);
    return () => window.removeEventListener("keydown", escape);
  }, [open]);

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

  const showPlace = (place: ChosenPlace) => {
    setError("");
    setChosen(place);
    setQuery("");
    setStep({ name: "confirm" });
  };

  const locateUser = async () => {
    if (isLocatingRef.current) return;
    isLocatingRef.current = true;
    const request = ++locationRequestRef.current;
    const isCurrentRequest = () => request === locationRequestRef.current;
    const finishRequest = () => {
      if (!isCurrentRequest()) return;
      isLocatingRef.current = false;
      setBusy(null);
    };

    setError("");
    setBusy("locate");

    if (!("geolocation" in navigator)) {
      setError(t("geolocationUnsupported"));
      finishRequest();
      return;
    }

    // Check first so a previously blocked site gets an explanation rather
    // than a prompt the browser will never show again.
    if (navigator.permissions) {
      try {
        const status = await navigator.permissions.query({
          name: "geolocation" as PermissionName,
        });
        if (!isCurrentRequest()) return;
        if (status.state === "denied") {
          setError(t("permissionBlocked"));
          finishRequest();
          return;
        }
      } catch {
        // Permissions API is optional; fall through to the prompt.
      }
    }

    if (!isCurrentRequest()) return;
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        if (!isCurrentRequest()) return;
        setBusy("address");
        try {
          const { address } = await reverseGeocode.mutateAsync({
            lat: coords.latitude,
            lng: coords.longitude,
          });
          if (!isCurrentRequest()) return;
          showPlace({
            address,
            latitude: coords.latitude,
            longitude: coords.longitude,
          });
        } catch (caught) {
          if (isCurrentRequest()) {
            setError(caught instanceof Error ? caught.message : t("reverseError"));
          }
        } finally {
          finishRequest();
        }
      },
      (positionError) => {
        if (!isCurrentRequest()) return;
        setError(
          positionError.code === positionError.PERMISSION_DENIED
            ? t("permissionDeclined")
            : positionError.code === positionError.TIMEOUT
              ? t("geolocationTimeout")
              : t("geolocationError"),
        );
        finishRequest();
      },
      { enableHighAccuracy: false, timeout: 20_000, maximumAge: 60_000 },
    );
  };

  const pickPrediction = async (prediction: Prediction) => {
    setBusy("resolve");
    setError("");
    try {
      const point = await placeDetails.mutateAsync(prediction.place_id);
      showPlace({
        address: prediction.description,
        latitude: point.lat,
        longitude: point.lng,
        label: prediction.structured_formatting?.main_text,
      });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : t("placeError"));
    } finally {
      setBusy(null);
    }
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
    } catch (caught) {
      if (selection === mapSelectionRef.current) {
        setError(caught instanceof Error ? caught.message : t("reverseError"));
      }
    } finally {
      if (selection === mapSelectionRef.current) setBusy(null);
    }
  };

  const pickPopularCity = (city: PopularCity) => {
    setError("");
    showPlace({
      address: city.address,
      latitude: city.latitude,
      longitude: city.longitude,
      label: city.name,
    });
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
      deliverHere();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : t("selectError"));
    } finally {
      setBusy(null);
    }
  };

  const editSavedAddress = (address: SavedAddress) => {
    const place = placeFromAddress(address);
    if (!place) return;
    setError("");
    setAddressToEdit(address);
    showPlace(place);
  };

  // Predictions are only meaningful for the term that fetched them, so the
  // visible list is derived rather than cleared when the query shortens.
  const visiblePredictions =
    query.trim() === debouncedQuery ? (searchQuery.data ?? []).slice(0, 6) : [];
  const searchStatus: SearchStatus = !query.trim()
    ? null
    : searchQuery.isFetching
      ? "searching"
      : query.trim().length < 3
        ? "keepTyping"
        : visiblePredictions.length
          ? null
          : query.trim() === debouncedQuery
            ? "noResults"
            : "searching";
  const remoteError =
    addressesQuery.error instanceof Error
      ? addressesQuery.error.message
      : searchQuery.error instanceof Error
        ? searchQuery.error.message
        : "";

  if (!open) return null;

  const renderStep = () => {
    switch (step.name) {
      case "current":
        return (
          <CurrentLocationStep
            isLocating={busy === "locate" || busy === "address"}
            isResolvingAddress={busy === "address"}
            error={error}
            onAllow={() => void locateUser()}
            onSearchManually={backToSearch}
            onBack={backToSearch}
            onClose={close}
          />
        );
      case "saved":
        return (
          <SavedAddressStep
            address={step.address}
            isSelecting={busy === "resolve"}
            error={error}
            onDeliverHere={() => void selectSavedAddress(step.address)}
            onEdit={() => editSavedAddress(step.address)}
            onBack={backToSearch}
            onClose={close}
          />
        );
      case "confirm":
        return chosen ? (
          <DeliveryConfirmStep
            key={addressToEdit?.id ?? "new"}
            place={chosen}
            canSaveAddress={canSaveAddress}
            isSaveRequired={isAddressBookMode || Boolean(addressToEdit)}
            addressToEdit={addressToEdit}
            isResolving={busy === "resolve"}
            error={error}
            onMapSelect={(latitude, longitude) => void pickMapPoint(latitude, longitude)}
            onDone={(didSave) =>
              isAddressBookMode ? setStep({ name: "done", didSave }) : deliverHere()
            }
            onBack={backToSearch}
            onClose={close}
          />
        ) : null;
      case "done":
        return (
          <LocationDoneStep
            address={chosen?.address ?? ""}
            didSave={step.didSave}
            actionLabel={t("done")}
            onClose={close}
          />
        );
      default:
        return (
          <LocationSearchStep
            title={isAddressBookMode ? t("addNew") : t("title")}
            query={query}
            onQueryChange={setQuery}
            predictions={visiblePredictions}
            searchStatus={searchStatus}
            onPickPrediction={(prediction) => void pickPrediction(prediction)}
            onPickCity={pickPopularCity}
            onUseCurrentLocation={() => {
              setError("");
              setStep({ name: "current" });
            }}
            onOpenSavedAddress={(address) => {
              setError("");
              setStep({ name: "saved", address });
            }}
            selectedSavedAddress={selectedSavedAddress}
            onContinueSelectedAddress={(address) => void selectSavedAddress(address)}
            canSaveAddress={canSaveAddress}
            showSavedAddresses={showSavedAddresses}
            savedAddresses={savedAddresses}
            isLoadingSaved={addressesQuery.isPending}
            isResolving={busy === "resolve"}
            error={error || remoteError}
            onClose={close}
          />
        );
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-[rgba(20,10,14,0.55)] p-0 sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="location-modal-title"
      onClick={(event) => {
        if (event.target === event.currentTarget) close();
      }}
    >
      <div className="flex max-h-[92svh] w-full flex-col overflow-hidden rounded-t-[22px] border border-line bg-card shadow-[0_12px_38px_rgba(20,10,14,0.12)] sm:max-w-107.5 sm:rounded-[22px]">
        {renderStep()}
      </div>
    </div>
  );
}
