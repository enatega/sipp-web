import { NextRequest, NextResponse } from "next/server";
import { callApi, requireSession } from "@/services/api/server";

export const dynamic = "force-dynamic";

/** Only the keys the platform's additional_fields DTO actually persists. */
const ADDITIONAL_KEYS = [
  "placeName", "howToFindYou", "deliveryInstructions",
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
  if (address.length > 255) return NextResponse.json({ message: "Address is too long." }, { status: 400 });
  const latitude = Number(body?.latitude);
  const longitude = Number(body?.longitude);
  const type = String(body?.type ?? "");

  if (!address) {
    return NextResponse.json(
      { message: "Pick a location before saving." },
      { status: 400 },
    );
  }
  if (body?.latitude == null || body?.longitude == null || body?.latitude === "" || body?.longitude === "" || !Number.isFinite(latitude) || !Number.isFinite(longitude) || Math.abs(latitude) > 90 || Math.abs(longitude) > 180) {
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
  if (body?.additional_fields !== undefined && (!body.additional_fields || typeof body.additional_fields !== "object" || Array.isArray(body.additional_fields))) return NextResponse.json({ message: "Invalid address details." }, { status: 400 });
  const incoming = (body?.additional_fields ?? {}) as Record<string, unknown>;
  const additional_fields: Record<string, string | null> = {};
  for (const key of ADDITIONAL_KEYS) {
    const value = incoming[key];
    if (Object.prototype.hasOwnProperty.call(incoming, key)) {
      if (value !== null && typeof value !== "string") return NextResponse.json({ message: "Invalid address detail." }, { status: 400 });
      additional_fields[key] = typeof value === "string" ? value.replace(/\r\n?/g, "\n").trim() || null : null;
    }
  }

  return callApi("/address", {
    method: "POST",
    request,
    body: {
      address,
      ...(body?.addressDetailsVersion !== undefined ? { addressDetailsVersion: body.addressDetailsVersion } : {}),
      ...(body?.expectedUpdatedAt !== undefined ? { expectedUpdatedAt: body.expectedUpdatedAt } : {}),
      latitude,
      longitude,
      type,
      ...(typeof body?.location_name === "string" && body.location_name.trim()
        ? { location_name: body.location_name.trim() }
        : {}),
      ...(Object.keys(additional_fields).length ? { additional_fields } : {}),
    },
  });
}
