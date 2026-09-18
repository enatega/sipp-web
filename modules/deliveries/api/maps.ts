import { apiRoutes } from "@/config/api";
import { requestJson } from "@/services/api/client";

export interface MapCoordinate {
  lat: number;
  lng: number;
}

interface RoutePathResponse {
  path?: [number, number][];
}

export const deliveryMapsApi = {
  async routePath(
    origin: MapCoordinate,
    destination: MapCoordinate,
    signal?: AbortSignal,
  ) {
    const query = new URLSearchParams({
      originLat: String(origin.lat),
      originLng: String(origin.lng),
      destinationLat: String(destination.lat),
      destinationLng: String(destination.lng),
    });
    const response = await requestJson<RoutePathResponse>(
      `${apiRoutes.maps.route}?${query.toString()}`,
      { cache: "no-store", signal },
    );

    if (!Array.isArray(response.path)) return [];

    return response.path.flatMap(([latitude, longitude]) =>
      Number.isFinite(latitude) && Number.isFinite(longitude)
        ? [{ lat: latitude, lng: longitude }]
        : [],
    );
  },
};
