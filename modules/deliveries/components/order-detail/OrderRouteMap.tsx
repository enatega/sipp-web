"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  DirectionsRenderer,
  GoogleMap,
  MarkerF,
  PolylineF,
  useJsApiLoader,
} from "@react-google-maps/api";
import { MapPin, Navigation, Store } from "lucide-react";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { DeliveryImage } from "../discovery/DeliveryImage";
import type { OrderDetail } from "../../types/orders";

interface Props {
  order: OrderDetail;
  storeName: string;
}

const LIBRARIES: ("geometry" | "places")[] = ["places", "geometry"];
const DARK_MAP_STYLES: google.maps.MapTypeStyle[] = [
  { elementType: "geometry", stylers: [{ color: "#242930" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#c7cbd1" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#1d2127" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#353b44" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#20242a" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#172530" }] },
  { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] },
];

function isCoordinate(value?: number | null) {
  return typeof value === "number" && Number.isFinite(value);
}

function createMarkerIcon(color: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="42" height="50" viewBox="0 0 42 50"><path fill="${color}" stroke="#ffffff" stroke-width="2" d="M21 1C10.5 1 2 9.5 2 20c0 14.5 19 28 19 28s19-13.5 19-28C40 9.5 31.5 1 21 1Z"/><circle cx="21" cy="20" r="10" fill="rgba(255,255,255,.18)"/></svg>`;
  return {
    anchor: new google.maps.Point(21, 50),
    labelOrigin: new google.maps.Point(21, 20),
    scaledSize: new google.maps.Size(42, 50),
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
  };
}

export function OrderRouteMap({ order, storeName }: Props) {
  const t = useTranslations("deliveries.orderDetails");
  const { resolvedTheme } = useTheme();
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";
  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-maps-loader-singleton",
    googleMapsApiKey: apiKey,
    libraries: LIBRARIES,
  });
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const details = order.deliveryDetails;
  const hasCoordinates =
    isCoordinate(details?.storeLatitude) &&
    isCoordinate(details?.storeLongitude) &&
    isCoordinate(details?.latitude) &&
    isCoordinate(details?.longitude);
  const storePoint = useMemo(
    () => ({ lat: details?.storeLatitude ?? 0, lng: details?.storeLongitude ?? 0 }),
    [details?.storeLatitude, details?.storeLongitude],
  );
  const destinationPoint = useMemo(
    () => ({ lat: details?.latitude ?? 0, lng: details?.longitude ?? 0 }),
    [details?.latitude, details?.longitude],
  );
  const isSamePoint = storePoint.lat === destinationPoint.lat && storePoint.lng === destinationPoint.lng;
  const isPickup = order.orderType === "pickup";
  const destination = details?.address || t("notAvailable");
  const center = {
    lat: (storePoint.lat + destinationPoint.lat) / 2,
    lng: (storePoint.lng + destinationPoint.lng) / 2,
  };

  const handleMapLoad = useCallback(
    (map: google.maps.Map) => {
      mapRef.current = map;
      if (!hasCoordinates) return;
      if (isSamePoint) {
        map.setCenter(storePoint);
        map.setZoom(15);
        return;
      }
      const bounds = new google.maps.LatLngBounds();
      bounds.extend(storePoint);
      bounds.extend(destinationPoint);
      map.fitBounds(bounds, 64);
    },
    [destinationPoint, hasCoordinates, isSamePoint, storePoint],
  );

  const handleMapUnmount = useCallback(() => {
    mapRef.current = null;
  }, []);

  const canRenderMap = Boolean(apiKey && isLoaded && !loadError && hasCoordinates);

  useEffect(() => {
    if (!canRenderMap || isSamePoint) return;
    let isCancelled = false;
    const service = new google.maps.DirectionsService();
    void service
      .route({
        destination: destinationPoint,
        origin: storePoint,
        travelMode: google.maps.TravelMode.DRIVING,
      })
      .then((result) => {
        if (isCancelled) return;
        setDirections(result);

        const routeBounds = result.routes[0]?.bounds;
        const map = mapRef.current;
        if (map && routeBounds) {
          map.fitBounds(routeBounds, {
            bottom: 58,
            left: 56,
            right: 56,
            top: 42,
          });

          google.maps.event.addListenerOnce(map, "idle", () => {
            const zoom = map.getZoom();
            if (typeof zoom === "number" && zoom > 16) map.setZoom(16);
          });
        }
      })
      .catch(() => {
        // Keep the direct fallback line visible if Directions is unavailable.
      });
    return () => {
      isCancelled = true;
    };
  }, [canRenderMap, destinationPoint, isSamePoint, storePoint]);

  return (
    <section className="mt-7 overflow-hidden rounded-2xl bg-card shadow-card">
      <div className="relative h-52 bg-[var(--soft-surface)] sm:h-64 lg:h-72">
        {canRenderMap ? (
          <GoogleMap
            aria-label={t("routeMapAlt", { store: storeName })}
            center={center}
            mapContainerClassName="size-full"
            onLoad={handleMapLoad}
            onUnmount={handleMapUnmount}
            options={{
              clickableIcons: false,
              fullscreenControl: false,
              gestureHandling: "cooperative",
              mapTypeControl: false,
              streetViewControl: false,
              styles: resolvedTheme === "dark" ? DARK_MAP_STYLES : undefined,
              zoomControl: true,
            }}
            zoom={13}
          >
            <MarkerF
              icon={createMarkerIcon("#66c0f2")}
              label={{ color: "#ffffff", fontSize: "12px", fontWeight: "700", text: "S" }}
              position={storePoint}
              title={t("mapStore")}
            />
            {!isSamePoint ? (
              <>
                <MarkerF
                  icon={createMarkerIcon("#177456")}
                  label={{ color: "#ffffff", fontSize: "12px", fontWeight: "700", text: "D" }}
                  position={destinationPoint}
                  title={t("mapDestination")}
                />
                {directions ? (
                  <DirectionsRenderer
                    directions={directions}
                    options={{
                      polylineOptions: {
                        strokeColor: "#66c0f2",
                        strokeOpacity: 0.9,
                        strokeWeight: 5,
                      },
                      preserveViewport: true,
                      suppressMarkers: true,
                    }}
                  />
                ) : (
                  <PolylineF
                    options={{
                      geodesic: true,
                      strokeColor: "#66c0f2",
                      strokeOpacity: 0.5,
                      strokeWeight: 3,
                    }}
                    path={[storePoint, destinationPoint]}
                  />
                )}
              </>
            ) : null}
          </GoogleMap>
        ) : isLoaded || loadError || !apiKey ? (
          <div className="absolute inset-0 grid place-items-center px-6 text-center">
            <div>
              <Navigation aria-hidden="true" className="mx-auto size-8 text-brand" />
              <p className="mt-3 text-sm font-semibold text-ink">{t("mapUnavailable")}</p>
              <p className="mt-1 text-xs text-body">{t("mapUnavailableHint")}</p>
            </div>
          </div>
        ) : (
          <div aria-label={t("mapLoading")} className="absolute inset-0 animate-pulse bg-[var(--soft-surface)]" role="status" />
        )}

        {canRenderMap ? (
          <div className="pointer-events-none absolute left-3 top-3 flex gap-2 rounded-full bg-card/95 p-1.5 shadow-card">
            <span className="inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[10px] font-bold text-body">
              <span className="grid size-5 place-items-center rounded-full bg-brand text-[9px] text-ink">S</span>
              {t("mapStore")}
            </span>
            {!isSamePoint ? (
              <span className="inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[10px] font-bold text-body">
                <span className="grid size-5 place-items-center rounded-full bg-success text-[9px] text-white">D</span>
                {isPickup ? t("mapPickup") : t("mapDestination")}
              </span>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="p-4 sm:p-5">
        <div className="flex min-w-0 items-center gap-3">
          <DeliveryImage alt={storeName} className="size-12 shrink-0 rounded-xl bg-white" contain sizes="48px" src={order.store?.logo} />
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-brand">{isPickup ? t("pickup") : t("delivery")}</p>
            <h2 className="truncate text-base font-bold text-ink sm:text-lg">{storeName}</h2>
          </div>
          <Store aria-hidden="true" className="size-5 shrink-0 text-muted" />
        </div>

        <div className="mt-4 flex items-start gap-3 border-t border-line pt-4">
          <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-success-soft text-success">
            <MapPin aria-hidden="true" className="size-4" />
          </span>
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted">{isPickup ? t("pickupAddress") : t("deliveryAddress")}</p>
            <p className="mt-1 line-clamp-2 text-sm leading-5 text-ink">{destination}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
