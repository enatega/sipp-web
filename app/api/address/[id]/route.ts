import { NextRequest, NextResponse } from "next/server";
import { callApi, requireSession } from "@/services/api/server";

const TYPES = ["HOME", "OFFICE", "APARTMENT", "OTHER"] as const;
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

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const unauthorized = requireSession(request);
  if (unauthorized) return unauthorized;

  const { id } = await context.params;
  const body = (await request.json().catch(() => null)) as Record<
    string,
    unknown
  > | null;
  const address = typeof body?.address === "string" ? body.address.trim() : "";
  const latitude = Number(body?.latitude);
  const longitude = Number(body?.longitude);
  const type = String(body?.type ?? "");

  if (!id || !address) {
    return NextResponse.json({ message: "That address is incomplete." }, { status: 400 });
  }
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return NextResponse.json(
      { message: "That location is missing its coordinates." },
      { status: 400 },
    );
  }
  if (!TYPES.includes(type as (typeof TYPES)[number])) {
    return NextResponse.json({ message: "Choose a valid address type." }, { status: 400 });
  }

  const incoming = (body?.additional_fields ?? {}) as Record<string, unknown>;
  const additional_fields: Record<string, string> = {};
  for (const key of ADDITIONAL_KEYS) {
    const value = incoming[key];
    if (typeof value === "string" && value.trim()) {
      additional_fields[key] = value.trim();
    }
  }

  return callApi(`/address/${encodeURIComponent(id)}`, {
    method: "PATCH",
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

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const unauthorized = requireSession(request);
  if (unauthorized) return unauthorized;

  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ message: "That address is missing." }, { status: 400 });
  }

  return callApi(`/address/${encodeURIComponent(id)}`, {
    method: "DELETE",
    request,
  });
}
