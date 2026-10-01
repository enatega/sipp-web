"use client";

import { useEffect, useRef } from "react";
import { LocateFixed, MapPin, Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { POPULAR_CITIES, type PopularCity } from "@/modules/account/data/popularCities";
import type { Prediction, SavedAddress } from "@/modules/account/types";
import { LocationAlert } from "@/modules/account/components/location/steps/LocationAlert";
import { LocationRow } from "@/modules/account/components/location/steps/LocationRow";
import { LocationStepHeader } from "@/modules/account/components/location/steps/LocationStepHeader";
import { SavedAddressIcon } from "@/modules/account/components/location/steps/SavedAddressIcon";

export type SearchStatus = "searching" | "keepTyping" | "noResults" | null;

interface Props {
  title: string;
  query: string;
  onQueryChange: (query: string) => void;
  predictions: Prediction[];
  searchStatus: SearchStatus;
  onPickPrediction: (prediction: Prediction) => void;
  onPickCity: (city: PopularCity) => void;
  onUseCurrentLocation: () => void;
  onOpenSavedAddress: (address: SavedAddress) => void;
  canSaveAddress: boolean;
  showSavedAddresses: boolean;
  savedAddresses: SavedAddress[];
  isLoadingSaved: boolean;
  isResolving: boolean;
  error: string;
  onClose: () => void;
}

const SECTION_LABEL = "mb-1 mt-6 text-[13px] font-semibold text-muted";
const ROW_ICON = "size-4.5";

export function LocationSearchStep({
  title,
  query,
  onQueryChange,
  predictions,
  searchStatus,
  onPickPrediction,
  onPickCity,
  onUseCurrentLocation,
  onOpenSavedAddress,
  canSaveAddress,
  showSavedAddresses,
  savedAddresses,
  isLoadingSaved,
  isResolving,
  error,
  onClose,
}: Props) {
  const t = useTranslations("location");
  const searchRef = useRef<HTMLInputElement>(null);
  const hasQuery = Boolean(query.trim());

  useEffect(() => {
    searchRef.current?.focus();
  }, []);

  return (
    <>
      <LocationStepHeader title={title} onClose={onClose} />

      <div className="flex-1 overflow-y-auto px-5 pb-6 sm:px-6">
        <label className="flex items-center gap-2.5 rounded-xl border border-line bg-soft-surface px-3.5 focus-within:border-brand">
          <Search aria-hidden="true" className="size-4.5 flex-none text-muted" />
          <input
            ref={searchRef}
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder={t("search")}
            aria-label={t("search")}
            autoComplete="off"
            className="min-w-0 flex-1 border-0 bg-transparent py-3.5 text-sm text-ink outline-none placeholder:text-muted"
          />
        </label>

        <LocationAlert message={error} />

        {hasQuery ? (
          <section aria-live="polite">
            <p className={SECTION_LABEL}>{t("searchResults")}</p>
            {predictions.map((prediction) => (
              <LocationRow
                key={prediction.place_id}
                icon={<MapPin aria-hidden="true" className={ROW_ICON} />}
                title={
                  prediction.structured_formatting?.main_text ??
                  prediction.description
                }
                subtitle={
                  prediction.structured_formatting?.secondary_text ??
                  prediction.description
                }
                onClick={() => onPickPrediction(prediction)}
                disabled={isResolving}
              />
            ))}
            {searchStatus ? (
              <p className="py-4 text-sm text-muted">{t(searchStatus)}</p>
            ) : null}
          </section>
        ) : (
          <>
            <LocationRow
              icon={<LocateFixed aria-hidden="true" className={ROW_ICON} />}
              title={t("current")}
              subtitle={t("currentDescription")}
              onClick={onUseCurrentLocation}
              isHighlighted
            />

            {canSaveAddress && showSavedAddresses ? (
              <section aria-labelledby="saved-addresses-title">
                <h3 id="saved-addresses-title" className={SECTION_LABEL}>
                  {t("saved")}
                </h3>
                {isLoadingSaved ? (
                  <div className="space-y-2 py-2" aria-label={t("loadingSaved")}>
                    {[0, 1].map((item) => (
                      <div key={item} className="h-12 animate-pulse rounded-lg bg-soft-surface" />
                    ))}
                  </div>
                ) : savedAddresses.length ? (
                  savedAddresses.map((address) => (
                    <LocationRow
                      key={address.id}
                      icon={<SavedAddressIcon type={address.type} className={ROW_ICON} />}
                      title={address.location_name || address.type.toLowerCase()}
                      subtitle={address.address}
                      badge={address.is_selected ? t("selected") : undefined}
                      onClick={() => onOpenSavedAddress(address)}
                      isHighlighted={address.is_selected}
                      isCapitalized
                    />
                  ))
                ) : (
                  <p className="py-3.5 text-sm text-muted">{t("noSavedAddresses")}</p>
                )}
              </section>
            ) : null}


            <section aria-labelledby="popular-locations-title">
              <h3 id="popular-locations-title" className={SECTION_LABEL}>
                {t("popularLocations")}
              </h3>
              {POPULAR_CITIES.map((city) => (
                <LocationRow
                  key={city.name}
                  icon={<MapPin aria-hidden="true" className={ROW_ICON} />}
                  title={city.name}
                  subtitle={city.address}
                  onClick={() => onPickCity(city)}
                  disabled={isResolving}
                />
              ))}
            </section>
          </>
        )}
      </div>
    </>
  );
}
