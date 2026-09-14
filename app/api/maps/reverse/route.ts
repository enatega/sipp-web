import { NextResponse } from "next/server";
import { callApi } from "@/services/api/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");

  if (!lat || !lng || Number.isNaN(Number(lat)) || Number.isNaN(Number(lng))) {
    return NextResponse.json(
      { message: "Valid lat and lng are required." },
      { status: 400 },
    );
  }

  return callApi(
    `/maps/address-from-coordinates?lat=${encodeURIComponent(lat)}&lng=${encodeURIComponent(lng)}`,
  );
}
