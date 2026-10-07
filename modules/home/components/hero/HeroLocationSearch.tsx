"use client";

import { useCallback, useEffect, useId, useRef, useState, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Icon } from "@/components/shared/brand/Icon";
import { cn } from "@/lib/utils";
import {
  POPULAR_CITIES,
  storePlace,
  usePlaceDetailsMutation,
  usePlaceSearchQuery,
  useReverseGeocodeMutation,
  type ChosenPlace,
  type Prediction,
} from "@/modules/account";

type HeroLocationSearchProps = {
  className?: string;
  style?: CSSProperties;
};

export function HeroLocationSearch({
  className,
  style,
}: HeroLocationSearchProps) {
  const t = useTranslations("homeLocation");
  const locationT = useTranslations("location");
  const router = useRouter();
  const listboxId = `hero-location-${useId().replaceAll(":", "")}`;
  const rootRef = useRef<HTMLDivElement>(null);
  const locationRequestRef = useRef(0);
  const locationWatchRef = useRef<number | null>(null);
  const locationFailureTimerRef = useRef<number | null>(null);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [busy, setBusy] = useState<"place" | "location" | null>(null);
  const [error, setError] = useState("");
  const searchQuery = usePlaceSearchQuery(debouncedQuery, suggestionsOpen);
  const placeDetails = usePlaceDetailsMutation();
  const reverseGeocode = useReverseGeocodeMutation();

  const stopWatchingLocation = useCallback(() => {
    if (locationWatchRef.current !== null) {
      navigator.geolocation.clearWatch(locationWatchRef.current);
      locationWatchRef.current = null;
    }
    if (locationFailureTimerRef.current !== null) {
      window.clearTimeout(locationFailureTimerRef.current);
      locationFailureTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    const term = query.trim();
    const timer = window.setTimeout(
      () => setDebouncedQuery(term.length >= 3 ? term : ""),
      term.length >= 3 ? 350 : 0,
    );
    return () => window.clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const closeSuggestions = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setSuggestionsOpen(false);
      }
    };
    document.addEventListener("pointerdown", closeSuggestions);
    return () => document.removeEventListener("pointerdown", closeSuggestions);
  }, []);

  useEffect(() => {
    const syncLocation = () => {
      locationRequestRef.current += 1;
      stopWatchingLocation();
      setBusy((current) => current === "location" ? null : current);
      setError("");
    };
    window.addEventListener("shaaneiol-location-change", syncLocation);
    return () => {
      locationRequestRef.current += 1;
      stopWatchingLocation();
      window.removeEventListener("shaaneiol-location-change", syncLocation);
    };
  }, [stopWatchingLocation]);

  const acceptLocation = (selectedPlace: ChosenPlace) => {
    storePlace(selectedPlace);
    setQuery("");
    setDebouncedQuery("");
    setSuggestionsOpen(false);
    setBusy(null);
    setError("");
    router.push("/discovery");
  };

  const selectPrediction = async (prediction: Prediction) => {
    setBusy("place");
    setError("");
    try {
      const point = await placeDetails.mutateAsync(prediction.place_id);
      acceptLocation({
        address: prediction.description,
        latitude: point.lat,
        longitude: point.lng,
        label: prediction.structured_formatting?.main_text,
      });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : locationT("placeError"));
      setBusy(null);
    }
  };

  const selectPopularCity = (city: (typeof POPULAR_CITIES)[number]) => {
    acceptLocation({
      address: city.address,
      latitude: city.latitude,
      longitude: city.longitude,
      label: city.name,
    });
  };

  const useCurrentLocation = () => {
    stopWatchingLocation();
    setError("");
    if (!("geolocation" in navigator)) {
      setError(locationT("geolocationUnsupported"));
      return;
    }

    setBusy("location");
    const request = ++locationRequestRef.current;
    let isResolvingAddress = false;
    let lastPositionError: GeolocationPositionError | null = null;
    const failLocation = (message: string) => {
      if (request !== locationRequestRef.current) return;
      stopWatchingLocation();
      setBusy(null);
      setError(message);
    };

    const watchId = navigator.geolocation.watchPosition(
      async ({ coords }) => {
        if (request !== locationRequestRef.current || isResolvingAddress) return;
        isResolvingAddress = true;
        stopWatchingLocation();
        try {
          const { address } = await reverseGeocode.mutateAsync({
            lat: coords.latitude,
            lng: coords.longitude,
          });
          if (request !== locationRequestRef.current) return;
          acceptLocation({
            address,
            latitude: coords.latitude,
            longitude: coords.longitude,
          });
        } catch (caught) {
          if (request !== locationRequestRef.current) return;
          setError(
            caught instanceof Error ? caught.message : locationT("reverseError"),
          );
          setBusy(null);
        }
      },
      (positionError) => {
        if (request !== locationRequestRef.current || isResolvingAddress) return;
        if (positionError.code === positionError.PERMISSION_DENIED) {
          failLocation(locationT("permissionDeclined"));
          return;
        }

        // A location watch can recover after a temporary provider error.
        lastPositionError = positionError;
        if (locationFailureTimerRef.current === null) {
          locationFailureTimerRef.current = window.setTimeout(() => {
            if (request !== locationRequestRef.current || isResolvingAddress) return;
            failLocation(
              lastPositionError?.code === lastPositionError?.TIMEOUT
                ? locationT("geolocationTimeout")
                : locationT("geolocationError"),
            );
          }, 30_000);
        }
      },
      { enableHighAccuracy: false, timeout: 20_000, maximumAge: 60_000 },
    );
    if (request === locationRequestRef.current) {
      locationWatchRef.current = watchId;
    } else {
      navigator.geolocation.clearWatch(watchId);
    }
  };

  const visiblePredictions =
    query.trim() === debouncedQuery ? (searchQuery.data ?? []).slice(0, 5) : [];
  const waitingForDebounce =
    query.trim().length >= 3 && query.trim() !== debouncedQuery;
  const searching = searchQuery.isFetching || busy === "place" || waitingForDebounce;
  const searchError =
    searchQuery.error instanceof Error ? searchQuery.error.message : "";
  const displayedError = error || searchError;
  return (
    <div
      ref={rootRef}
      className={cn("relative z-30 w-full max-w-[500px]", className)}
      style={style}
    >
      <div className="flex min-h-13 min-w-0 items-center rounded-[14px] border border-brand/20 bg-card transition-[border-color,box-shadow] duration-200 hover:border-brand/35 focus-within:border-brand focus-within:shadow-[0_8px_24px_rgba(102,192,242,0.12)]">
          <Icon name="pin" className="ml-3.5 size-[18px] flex-none text-brand" />
          <input
            value={query}
            onFocus={() => setSuggestionsOpen(true)}
            onChange={(event) => {
              setQuery(event.target.value);
              setError("");
              setSuggestionsOpen(true);
            }}
            onKeyDown={(event) => {
              if (event.key === "Escape") setSuggestionsOpen(false);
              if (event.key === "Enter" && visiblePredictions[0]) {
                event.preventDefault();
                void selectPrediction(visiblePredictions[0]);
              }
            }}
            role="combobox"
            aria-label={t("inputLabel")}
            aria-expanded={suggestionsOpen && query.trim().length >= 3}
            aria-controls={listboxId}
            aria-autocomplete="list"
            name="delivery-location-query"
            autoComplete="off"
            spellCheck={false}
            placeholder={t("placeholder")}
            className="h-13 min-w-0 flex-1 border-0 bg-transparent px-3 text-sm font-medium text-ink outline-none placeholder:text-muted"
          />
          {searching ? (
            <span
              className="mr-2 size-4 flex-none animate-spin rounded-full border-2 border-line border-t-brand"
              aria-label={t("searching")}
            />
          ) : null}
          <button
            type="button"
            onClick={useCurrentLocation}
            disabled={busy !== null}
            className="inline-flex h-8 flex-none items-center justify-center gap-1.5 border-l border-brand/20 bg-transparent px-2.5 text-xs font-semibold text-brand transition-colors duration-200 hover:bg-brand-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand disabled:cursor-wait disabled:opacity-55 sm:px-3.5"
            aria-label={busy === "location" ? locationT("findingYou") : t("currentLocation")}
          >
            {busy === "location" ? (
              <span aria-hidden="true" className="size-4 animate-spin rounded-full border-2 border-brand/25 border-t-brand" />
            ) : (
              <Icon name="locate" className="size-4" />
            )}
            <span className="hidden sm:inline">
              {busy === "location" ? locationT("findingYou") : t("currentLocation")}
            </span>
          </button>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-muted">{t("popularCities")}</span>
        {POPULAR_CITIES.map((city) => (
          <button
            key={city.name}
            type="button"
            onClick={() => selectPopularCity(city)}
            disabled={busy !== null}
            className="inline-flex items-center gap-1.5 rounded-full border border-brand/20 bg-card px-3 py-1.5 text-xs font-semibold text-ink transition-colors duration-200 hover:border-brand/40 hover:bg-brand-soft disabled:cursor-wait disabled:opacity-55"
          >
            <Icon name="pin" className="size-3 flex-none text-brand" />
            {city.name}
          </button>
        ))}
      </div>

      {displayedError && !(suggestionsOpen && query.trim().length >= 3) ? (
        <div className="pt-1.5" aria-live="polite">
          <p role="alert" className="text-xs font-medium text-danger">
            {displayedError}
          </p>
        </div>
      ) : null}

      {suggestionsOpen && query.trim().length >= 3 ? (
        <div
          id={listboxId}
          role="listbox"
          className="absolute left-0 right-0 top-[calc(100%+8px)] z-[80] max-h-[240px] overflow-y-auto rounded-[14px] bg-card p-1.5 shadow-[0_16px_42px_rgba(35,22,26,0.16)] ring-1 ring-line"
        >
          {displayedError ? (
            <p role="alert" className="rounded-[10px] bg-danger-soft px-3 py-2.5 text-xs text-danger">
              {displayedError}
            </p>
          ) : visiblePredictions.length ? (
            visiblePredictions.map((prediction) => (
              <button
                key={prediction.place_id}
                type="button"
                role="option"
                aria-selected="false"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => void selectPrediction(prediction)}
                disabled={busy !== null}
                className="flex w-full items-start gap-2.5 rounded-[10px] px-3 py-2.5 text-left transition-colors hover:bg-[var(--soft-surface)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand disabled:opacity-60"
              >
                <Icon name="pin" className="mt-0.5 size-4 flex-none text-brand" />
                <span className="min-w-0">
                  <b className="block truncate text-sm font-semibold text-ink">
                    {prediction.structured_formatting?.main_text ??
                      prediction.description}
                  </b>
                  <small className="mt-0.5 block truncate text-xs text-muted">
                    {prediction.structured_formatting?.secondary_text ??
                      prediction.description}
                  </small>
                </span>
              </button>
            ))
          ) : searchQuery.isFetched && !searching ? (
            <p className="px-3 py-2.5 text-xs text-body">{t("noResults")}</p>
          ) : (
            <p className="px-3 py-2.5 text-xs text-body">{t("searching")}</p>
          )}
        </div>
      ) : null}
    </div>
  );
}
