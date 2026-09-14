import { NextRequest, NextResponse } from "next/server";
import { callApi, requireSession } from "@/services/api/server";

export const dynamic = "force-dynamic";

/** Only the keys the platform's additional_fields DTO actually persists. */
const ADDITIONAL_KEYS = [
  "apartmentNo",
  "building",
  "companyName",
  "department",
  "floorNo",
  "houseNo",
  "landmark",
  "societyArea",
] as const;

const TYPES = ["HOME", "OFFICE", "APARTMENT", "OTHER"] as const;

export async function GET(request: NextRequest) {
  const unauthorized = requireSession(request);
  if (unauthorized) return unauthorized;

  const offset = new URL(request.url).searchParams.get("offset") ?? "0";
  return callApi(`/address?offset=${encodeURIComponent(offset)}`, { request });
}

export async function POST(request: NextRequest) {
  const unauthorized = requireSession(request);
  if (unauthorized) return unauthorized;

  const body = (await request.json().catch(() => null)) as Record<
    string,
    unknown
  > | null;

  const address = typeof body?.address === "string" ? body.address.trim() : "";
  const latitude = Number(body?.latitude);
  const longitude = Number(body?.longitude);
  const type = String(body?.type ?? "");

  if (!address) {
    return NextResponse.json(
      { message: "Pick a location before saving." },
      { status: 400 },
    );
  }
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return NextResponse.json(
      { message: "That location is missing its coordinates." },
      { status: 400 },
    );
  }
  if (!TYPES.includes(type as (typeof TYPES)[number])) {
    return NextResponse.json(
      { message: "Choose whether this is home, work, or somewhere else." },
      { status: 400 },
    );
  }

  // Drop anything the upstream DTO would silently strip, so the client never
  // believes it saved a field that does not exist.
  const incoming = (body?.additional_fields ?? {}) as Record<string, unknown>;
  const additional_fields: Record<string, string> = {};
  for (const key of ADDITIONAL_KEYS) {
    const value = incoming[key];
    if (typeof value === "string" && value.trim()) {
      additional_fields[key] = value.trim();
    }
  }

  return callApi("/address", {
    method: "POST",
    request,
    body: {
      address: address.slice(0, 255),
      latitude,
      longitude,
      type,
      ...(typeof body?.location_name === "string" && body.location_name.trim()
        ? { location_name: body.location_name.trim().slice(0, 255) }
        : {}),
      ...(Object.keys(additional_fields).length ? { additional_fields } : {}),
    },
  });
}
