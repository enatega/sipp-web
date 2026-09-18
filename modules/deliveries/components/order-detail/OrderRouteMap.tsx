"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  GoogleMap,
  MarkerF,
  PolylineF,
  useJsApiLoader,
} from "@react-google-maps/api";
import { MapPin, Navigation, Store } from "lucide-react";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { DeliveryImage } from "../discovery/DeliveryImage";
import { useOrderRoutePath } from "../../hooks/useOrderRoutePath";
import type { OrderDetail } from "../../types/orders";

interface Props {
  order: OrderDetail;
  storeName: string;
}

interface Coordinate {
  lat: number;
  lng: number;
}

const LIBRARIES: ("geometry" | "places")[] = ["places", "geometry"];
const POST_PICKUP_STATUSES = new Set([
  "picked_up",
  "out_for_delivery",
  "arrived",
  "delivered",
]);
const DARK_MAP_STYLES: google.maps.MapTypeStyle[] = [
  { elementType: "geometry", stylers: [{ color: "#242930" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#c7cbd1" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#1d2127" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#353b44" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#20242a" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#172530" }] },
  { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] },
];

function isCoordinate(value?: number | null): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function point(latitude?: number | null, longitude?: number | null) {
  return isCoordinate(latitude) && isCoordinate(longitude)
    ? { lat: latitude, lng: longitude }
    : null;
}

function riderPoint(order: OrderDetail) {
  return (
    point(
      order.rider?.currentLocation?.latitude,
      order.rider?.currentLocation?.longitude,
    ) ??
    point(order.rider?.latitude, order.rider?.longitude) ??
    point(
      order.eta?.riderLocation?.latitude,
      order.eta?.riderLocation?.longitude,
    )
  );
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

function fitMap(map: google.maps.Map, coordinates: Coordinate[]) {
  if (!coordinates.length) return;

  if (coordinates.length === 1) {
    map.setCenter(coordinates[0]);
    map.setZoom(15);
    return;
  }

  const bounds = new google.maps.LatLngBounds();
  coordinates.forEach((coordinate) => bounds.extend(coordinate));
  map.fitBounds(bounds, {
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

export function OrderRouteMap({ order, storeName }: Props) {
  const t = useTranslations("deliveries.orderDetails");
  const { resolvedTheme } = useTheme();
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";
  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-maps-loader-singleton",
    googleMapsApiKey: apiKey,
    libraries: LIBRARIES,
  });
  const mapRef = useRef<google.maps.Map | null>(null);
  const lastFitSignatureRef = useRef("");
  const details = order.deliveryDetails;
  const store = useMemo(
    () => point(details?.storeLatitude, details?.storeLongitude),
    [details?.storeLatitude, details?.storeLongitude],
  );
  const destinationPoint = useMemo(
    () => point(details?.latitude, details?.longitude),
    [details?.latitude, details?.longitude],
  );
  const rider = useMemo(
    () => riderPoint(order),
    [
      order.eta?.riderLocation?.latitude,
      order.eta?.riderLocation?.longitude,
      order.rider?.currentLocation?.latitude,
      order.rider?.currentLocation?.longitude,
      order.rider?.latitude,
      order.rider?.longitude,
    ],
  );
  const isPickup = order.orderType === "pickup";
  const isPostPickup =
    order.orderType === "delivery" &&
    POST_PICKUP_STATUSES.has(order.status.trim().toLowerCase());
  const routeOrigin = isPostPickup ? rider : store;
  const routeDestination = destinationPoint;
  const routePathQuery = useOrderRoutePath(routeOrigin, routeDestination, {
    staleTime: order.orderType === "delivery" ? 2 * 60 * 1_000 : 10 * 60 * 1_000,
  });
  const routePath = routePathQuery.data ?? [];
  const visibleEndpoints = useMemo(
    () => [routeOrigin, routeDestination].filter(Boolean) as Coordinate[],
    [routeDestination, routeOrigin],
  );
  const fitCoordinates = useMemo(
    () =>
      routePath.length >= 2
        ? [...routePath, ...visibleEndpoints]
        : visibleEndpoints,
    [routePath, visibleEndpoints],
  );
  const fitSignature = fitCoordinates
    .map(({ lat, lng }) => `${lat.toFixed(3)}:${lng.toFixed(3)}`)
    .join("|");
  const center = visibleEndpoints.length
    ? visibleEndpoints.reduce(
        (result, coordinate) => ({
          lat: result.lat + coordinate.lat / visibleEndpoints.length,
          lng: result.lng + coordinate.lng / visibleEndpoints.length,
        }),
        { lat: 0, lng: 0 },
      )
    : null;
  const [initialCenter] = useState(center);
  const isSamePoint = Boolean(
    routeOrigin &&
      routeDestination &&
      routeOrigin.lat === routeDestination.lat &&
      routeOrigin.lng === routeDestination.lng,
  );
  const destination = details?.address || t("notAvailable");
  const canRenderMap = Boolean(
    apiKey &&
      isLoaded &&
      !loadError &&
      center &&
      destinationPoint &&
      (store || rider),
  );

  const handleMapLoad = useCallback(
    (map: google.maps.Map) => {
      mapRef.current = map;
      lastFitSignatureRef.current = fitSignature;
      fitMap(map, fitCoordinates);
    },
    [fitCoordinates, fitSignature],
  );

  const handleMapUnmount = useCallback(() => {
    mapRef.current = null;
  }, []);

  useEffect(() => {
    if (
      !mapRef.current ||
      !fitSignature ||
      lastFitSignatureRef.current === fitSignature
    ) {
      return;
    }
    lastFitSignatureRef.current = fitSignature;
    fitMap(mapRef.current, fitCoordinates);
  }, [fitCoordinates, fitSignature]);

  return (
    <section className="mt-7 overflow-hidden rounded-2xl bg-card shadow-card">
      <div className="relative h-52 bg-[var(--soft-surface)] sm:h-64 lg:h-72">
        {canRenderMap && initialCenter ? (
          <GoogleMap
            aria-label={t("routeMapAlt", { store: storeName })}
            center={initialCenter}
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
            {!isPostPickup && store ? (
              <MarkerF
                icon={createMarkerIcon("#66c0f2")}
                label={{ color: "#ffffff", fontSize: "12px", fontWeight: "700", text: "S" }}
                position={store}
                title={t("mapStore")}
              />
            ) : null}
            {destinationPoint ? (
              <MarkerF
                icon={createMarkerIcon("#177456")}
                label={{ color: "#ffffff", fontSize: "12px", fontWeight: "700", text: "D" }}
                position={destinationPoint}
                title={t("mapDestination")}
              />
            ) : null}
            {isPostPickup && rider ? (
              <MarkerF
                icon={createMarkerIcon("#e33935")}
                label={{ color: "#ffffff", fontSize: "12px", fontWeight: "700", text: "R" }}
                position={rider}
                title={t("mapRider")}
              />
            ) : null}
            {!isSamePoint && routePath.length >= 2 ? (
              <PolylineF
                options={{
                  geodesic: true,
                  strokeColor: "#66c0f2",
                  strokeOpacity: 0.9,
                  strokeWeight: 5,
                }}
                path={routePath}
              />
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
            {(!isPostPickup && store) || (isPostPickup && rider) ? (
              <span className="inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[10px] font-bold text-body">
                <span className={`grid size-5 place-items-center rounded-full text-[9px] text-white ${isPostPickup ? "bg-danger" : "bg-brand"}`}>
                  {isPostPickup ? "R" : "S"}
                </span>
                {isPostPickup ? t("mapRider") : t("mapStore")}
              </span>
            ) : null}
            <span className="inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[10px] font-bold text-body">
              <span className="grid size-5 place-items-center rounded-full bg-success text-[9px] text-white">D</span>
              {isPickup ? t("mapPickup") : t("mapDestination")}
            </span>
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
