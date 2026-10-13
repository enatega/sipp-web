import { NextRequest, NextResponse } from "next/server";
import { callApi } from "@/services/api/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const latitudeText = request.nextUrl.searchParams.get("latitude")?.trim();
  const longitudeText = request.nextUrl.searchParams.get("longitude")?.trim();
  const latitude = Number(latitudeText);
  const longitude = Number(longitudeText);

  if (
    !latitudeText || !longitudeText ||
    !Number.isFinite(latitude) || !Number.isFinite(longitude) ||
    latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180
  ) {
    return NextResponse.json({ message: "Valid coordinates are required." }, { status: 400 });
  }

  const response = await callApi(
    `/zones/check?lat=${encodeURIComponent(latitude)}&lng=${encodeURIComponent(longitude)}`,
    { request },
  );

  if (response.ok) return NextResponse.json({ available: true });

  if (response.status === 400) {
    const payload = await response.json().catch(() => null) as { message?: unknown } | null;
    if (typeof payload?.message === "string" && /outside the valid service zone/i.test(payload.message)) {
      return NextResponse.json({ available: false });
    }
  }

  return response;
}
