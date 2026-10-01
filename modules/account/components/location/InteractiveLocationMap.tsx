"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { GoogleMap, useJsApiLoader } from "@react-google-maps/api";
import { useTranslations } from "next-intl";

type InteractiveLocationMapProps = {
  latitude?: number;
  longitude?: number;
  onSelect?: (latitude: number, longitude: number) => void;
  onInitialLocation?: (latitude: number, longitude: number) => void;
  ariaLabel: string;
  /** Preview only: same map and marker, but no dragging, clicks or controls. */
  isReadOnly?: boolean;
};

const LIBRARIES: ("geometry" | "places")[] = ["places", "geometry"];
const DEFAULT_CENTER = { lat: 40.7128, lng: -74.006 };
const MAP_ID = "DEMO_MAP_ID";

function markerPositionToLiteral(
  position:
    | google.maps.LatLng
    | google.maps.LatLngLiteral
    | google.maps.LatLngAltitude
    | google.maps.LatLngAltitudeLiteral
    | null
    | undefined,
) {
  if (!position) return null;
  if (position instanceof google.maps.LatLng) return position.toJSON();
  if ("lat" in position && "lng" in position) {
    return { lat: Number(position.lat), lng: Number(position.lng) };
  }
  return null;
}

export function InteractiveLocationMap({
  latitude,
  longitude,
  onSelect,
  onInitialLocation,
  ariaLabel,
  isReadOnly = false,
}: InteractiveLocationMapProps) {
  const t = useTranslations("location");
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";
  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-maps-loader-singleton",
    googleMapsApiKey: apiKey,
    libraries: LIBRARIES,
  });
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [userLocation, setUserLocation] =
    useState<google.maps.LatLngLiteral | null>(null);
  const [isMarkerReady, setIsMarkerReady] = useState(false);
  const markerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(null);
  const markerLibraryRef = useRef<google.maps.MarkerLibrary | null>(null);
  const onSelectRef = useRef(onSelect);
  const onInitialLocationRef = useRef(onInitialLocation);

  useEffect(() => {
    onSelectRef.current = onSelect;
    onInitialLocationRef.current = onInitialLocation;
  }, [onInitialLocation, onSelect]);

  const selectedPoint = useMemo(
    () =>
      Number.isFinite(latitude) && Number.isFinite(longitude)
        ? { lat: latitude as number, lng: longitude as number }
        : null,
    [latitude, longitude],
  );

  useEffect(() => {
    // A read-only preview always has a point; never ask for the visitor's.
    if (isReadOnly || !navigator.geolocation) return;
    let isCancelled = false;

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        if (isCancelled) return;
        const point = { lat: coords.latitude, lng: coords.longitude };
        setUserLocation(point);
        onInitialLocationRef.current?.(point.lat, point.lng);
      },
      () => {
        // Match the admin map: keep the fallback center when access is denied.
      },
      { enableHighAccuracy: false, maximumAge: 5 * 60_000, timeout: 10_000 },
    );

    return () => {
      isCancelled = true;
    };
  }, [isReadOnly]);

  useEffect(() => {
    if (!isLoaded) return;
    let isCancelled = false;

    void google.maps.importLibrary("marker").then((library) => {
      if (!isCancelled) {
        markerLibraryRef.current = library as google.maps.MarkerLibrary;
        setIsMarkerReady(true);
      }
    });

    return () => {
      isCancelled = true;
    };
  }, [isLoaded]);

  useEffect(() => {
    const point = selectedPoint ?? userLocation;
    if (!map || !point) return;
    map.setCenter(point);
    map.setZoom(selectedPoint ? 17 : 15);
  }, [map, selectedPoint, userLocation]);

  useEffect(() => {
    const point = selectedPoint ?? userLocation;
    if (!map || !point || !isMarkerReady || !markerLibraryRef.current) return;

    if (!markerRef.current) {
      const pin = new markerLibraryRef.current.PinElement({
        scale: 0.85,
      });
      const marker = new markerLibraryRef.current.AdvancedMarkerElement({
        content: pin.element,
        gmpDraggable: !isReadOnly,
        map,
        position: point,
        title: t("selectedLocation"),
      });
      if (!isReadOnly) {
        marker.addListener("dragend", () => {
          const position = markerPositionToLiteral(marker.position);
          if (position) onSelectRef.current?.(position.lat, position.lng);
        });
      }
      markerRef.current = marker;
    } else {
      markerRef.current.position = point;
      markerRef.current.map = map;
    }

    return () => {
      if (!markerRef.current) return;
      google.maps.event.clearInstanceListeners(markerRef.current);
      markerRef.current.map = null;
      markerRef.current = null;
    };
  }, [isMarkerReady, isReadOnly, map, selectedPoint, t, userLocation]);

  const handleMapClick = useCallback((event: google.maps.MapMouseEvent) => {
    const point = event.latLng?.toJSON();
    if (point) onSelectRef.current?.(point.lat, point.lng);
  }, []);

  if (!apiKey) {
    return (
      <div role="alert" className="grid h-56 place-items-center rounded-xl bg-[var(--soft-surface)] px-6 text-center text-xs text-body">
        {t("mapNotConfigured")}
      </div>
    );
  }

  if (loadError) {
    return (
      <div role="alert" className="grid h-56 place-items-center rounded-xl bg-[var(--soft-surface)] px-6 text-center text-xs text-body">
        {t("mapLoadError")}
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div
        role="status"
        className="h-56 animate-pulse rounded-xl bg-[var(--soft-surface)]"
        aria-label={t("mapLoading")}
      />
    );
  }

  return (
    <GoogleMap
      center={selectedPoint ?? userLocation ?? DEFAULT_CENTER}
      zoom={selectedPoint ? 17 : userLocation ? 15 : 10}
      mapContainerClassName="h-56 w-full overflow-hidden rounded-xl"
      onClick={isReadOnly ? undefined : handleMapClick}
      onLoad={setMap}
      onUnmount={() => setMap(null)}
      options={isReadOnly ? {
        mapId: MAP_ID,
        disableDefaultUI: true,
        gestureHandling: "none",
        keyboardShortcuts: false,
        clickableIcons: false,
      } : {
        fullscreenControl: false,
        mapId: MAP_ID,
        controlSize: 22,
        mapTypeControl: true,
        mapTypeControlOptions: {
          position: google.maps.ControlPosition.LEFT_BOTTOM,
          style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
        },
        streetViewControl: false,
        zoomControl: true,
        zoomControlOptions: {
          position: google.maps.ControlPosition.RIGHT_BOTTOM,
        },
      }}
      aria-label={ariaLabel}
    />
  );
}
