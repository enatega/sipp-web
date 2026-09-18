"use client";

import { useQuery } from "@tanstack/react-query";
import {
  deliveryMapsApi,
  type MapCoordinate,
} from "../api/maps";
import { deliveryQueryKeys } from "../queries/queryKeys";

const MAX_RENDERED_ROUTE_POINTS = 160;

function routeKey(value?: number) {
  return typeof value === "number" && Number.isFinite(value)
    ? value.toFixed(3)
    : "unknown";
}

function reduceRoutePoints(points: MapCoordinate[]) {
  if (points.length <= MAX_RENDERED_ROUTE_POINTS) return points;

  const lastIndex = points.length - 1;
  return Array.from({ length: MAX_RENDERED_ROUTE_POINTS }, (_, index) => {
    const sourceIndex = Math.round(
      (index / (MAX_RENDERED_ROUTE_POINTS - 1)) * lastIndex,
    );
    return points[sourceIndex];
  });
}

export function useOrderRoutePath(
  origin: MapCoordinate | null,
  destination: MapCoordinate | null,
  options?: { staleTime?: number },
) {
  return useQuery({
    queryKey: deliveryQueryKeys.route(
      `origin:${routeKey(origin?.lat)}:${routeKey(origin?.lng)}`,
      `destination:${routeKey(destination?.lat)}:${routeKey(destination?.lng)}`,
    ),
    queryFn: ({ signal }) =>
      origin && destination
        ? deliveryMapsApi.routePath(origin, destination, signal)
        : Promise.resolve([]),
    enabled: Boolean(origin && destination),
    staleTime: options?.staleTime ?? 2 * 60 * 1_000,
    gcTime: 30 * 60 * 1_000,
    refetchOnWindowFocus: false,
    retry: false,
    select: reduceRoutePoints,
  });
}
