"use client";

import { GoogleMap, InfoWindowF, MarkerF, useJsApiLoader } from "@react-google-maps/api";
import { MapPin } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import type { DeliveryStore, DiscoveryLocation } from "@/modules/deliveries/types/discovery";

const DEFAULT_CENTER = { lat: 24.8607, lng: 67.0011 };
const LIBRARIES: ("geometry" | "places")[] = ["places", "geometry"];

export function DiscoveryStoresMap({ stores, location }: { stores: DeliveryStore[]; location: DiscoveryLocation | null }) {
  const t = useTranslations("deliveries.seeAll");
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";
  const { isLoaded, loadError } = useJsApiLoader({ id: "google-maps-loader-singleton", googleMapsApiKey: apiKey, libraries: LIBRARIES });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const markers = useMemo(() => stores.filter((store) => Number.isFinite(store.latitude) && Number.isFinite(store.longitude)), [stores]);
  const center = location ? { lat: location.latitude, lng: location.longitude } : markers[0] ? { lat: markers[0].latitude!, lng: markers[0].longitude! } : DEFAULT_CENTER;
  const selected = markers.find((store) => store.storeId === selectedId);

  if (!apiKey || loadError) return <div role="status" className="grid min-h-[420px] place-items-center rounded-2xl bg-[var(--soft-surface)] p-8 text-center"><div><MapPin className="mx-auto size-8 text-brand" aria-hidden="true" /><h2 className="mt-4 text-base font-bold text-ink">{t("mapUnavailableTitle")}</h2><p className="mt-2 max-w-md text-sm leading-6 text-body">{t("mapUnavailableDescription")}</p></div></div>;
  if (!isLoaded) return <div className="min-h-[520px] animate-pulse rounded-2xl bg-[var(--soft-surface)]" aria-label={t("mapLoading")} />;
  if (!markers.length) return <div role="status" className="grid min-h-[420px] place-items-center rounded-2xl bg-[var(--soft-surface)] p-8 text-center text-sm text-body">{t("noMapLocations")}</div>;

  return (
    <GoogleMap mapContainerClassName="h-[min(68vh,680px)] min-h-[460px] w-full overflow-hidden rounded-2xl" center={center} zoom={12} options={{ fullscreenControl: false, mapTypeControl: false, streetViewControl: false, clickableIcons: false }}>
      {markers.map((store) => <MarkerF key={store.storeId} position={{ lat: store.latitude!, lng: store.longitude! }} title={store.name} onClick={() => setSelectedId(store.storeId)} />)}
      {selected ? <InfoWindowF position={{ lat: selected.latitude!, lng: selected.longitude! }} onCloseClick={() => setSelectedId(null)}><div className="max-w-52 p-1 text-slate-900"><strong className="block text-sm">{selected.name}</strong><span className="mt-1 block text-xs text-slate-600">{selected.address}</span><a className="mt-2 inline-block text-xs font-bold text-[#b7182f]" href={`/restaurants/${encodeURIComponent(selected.storeId)}`}>{t("openStore", { name: selected.name })}</a></div></InfoWindowF> : null}
    </GoogleMap>
  );
}
