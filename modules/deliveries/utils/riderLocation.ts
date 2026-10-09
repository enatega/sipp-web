export interface LatLng {
  lat: number;
  lng: number;
}

/** Riders are local; anything farther than this from the order is stale or test GPS data. */
export const MAX_RIDER_DISTANCE_KM = 100;

export function distanceKm(a: LatLng, b: LatLng): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
}

/**
 * Drops a rider position that is implausibly far from both the store and the
 * delivery address, so one bad GPS fix cannot drag the map to another continent.
 */
export function plausibleRiderPoint(
  rider: LatLng | null,
  anchors: (LatLng | null)[],
  maxKm = MAX_RIDER_DISTANCE_KM,
): LatLng | null {
  if (!rider) return null;
  const known = anchors.filter((anchor): anchor is LatLng => anchor !== null);
  if (!known.length) return rider;
  return known.some((anchor) => distanceKm(rider, anchor) <= maxKm) ? rider : null;
}
