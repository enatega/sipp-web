import { NextRequest, NextResponse } from "next/server";
import { getPublicApi } from "@/services/api/server";

function coordinate(
  value: string | null,
  minimum: number,
  maximum: number,
) {
  if (value === null || value.trim() === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= minimum && parsed <= maximum
    ? parsed
    : null;
}

export async function GET(request: NextRequest) {
  const originLatitude = coordinate(
    request.nextUrl.searchParams.get("originLat"),
    -90,
    90,
  );
  const originLongitude = coordinate(
    request.nextUrl.searchParams.get("originLng"),
    -180,
    180,
  );
  const destinationLatitude = coordinate(
    request.nextUrl.searchParams.get("destinationLat"),
    -90,
    90,
  );
  const destinationLongitude = coordinate(
    request.nextUrl.searchParams.get("destinationLng"),
    -180,
    180,
  );

  if (
    originLatitude === null ||
    originLongitude === null ||
    destinationLatitude === null ||
    destinationLongitude === null
  ) {
    return NextResponse.json(
      { message: "Valid origin and destination coordinates are required." },
      { status: 400 },
    );
  }

  const query = new URLSearchParams({
    originLat: String(originLatitude),
    originLng: String(originLongitude),
    destinationLat: String(destinationLatitude),
    destinationLng: String(destinationLongitude),
  });

  return getPublicApi(`/maps/route?${query.toString()}`);
}
