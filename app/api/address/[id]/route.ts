import { NextRequest, NextResponse } from "next/server";
import { callApi, requireSession } from "@/services/api/server";

const TYPES = ["HOME", "OFFICE", "APARTMENT", "OTHER"] as const;
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

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const unauthorized = requireSession(request);
  if (unauthorized) return unauthorized;
  const { id } = await context.params;
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  const invalid = (message: string) => NextResponse.json({ message }, { status: 400 });
  if (!id || !body || typeof body !== "object" || Array.isArray(body)) return invalid("That address is incomplete.");
  const payload: Record<string, unknown> = {};
  if (body.address !== undefined) {
    if (typeof body.address !== "string" || !body.address.trim() || body.address.trim().length > 255) return invalid("Invalid address text.");
    payload.address = body.address.trim();
  }
  for (const key of ["latitude", "longitude"] as const) {
    if (body[key] === undefined) continue;
    const value = body[key];
    if (typeof value !== "number" || !Number.isFinite(value) || Math.abs(value) > (key === "latitude" ? 90 : 180)) return invalid("Invalid address coordinates.");
    payload[key] = value;
  }
  if (body.type !== undefined) {
    if (!TYPES.includes(body.type as typeof TYPES[number])) return invalid("Choose a valid address type.");
    payload.type = body.type;
  }
  if (body.location_name !== undefined) {
    if (body.location_name !== null && (typeof body.location_name !== "string" || body.location_name.trim().length > 255)) return invalid("Invalid location name.");
    payload.location_name = typeof body.location_name === "string" ? body.location_name.trim() || null : null;
  }
  if (body.additional_fields !== undefined) {
    if (!body.additional_fields || typeof body.additional_fields !== "object" || Array.isArray(body.additional_fields)) return invalid("Invalid address details.");
    const incoming = body.additional_fields as Record<string, unknown>;
    const fields: Record<string, string | null> = {};
    for (const key of ADDITIONAL_KEYS) {
      if (!Object.prototype.hasOwnProperty.call(incoming, key)) continue;
      const value = incoming[key];
      if (value !== null && typeof value !== "string") return invalid("Invalid address detail.");
      fields[key] = typeof value === "string" ? value.replace(/\r\n?/g, "\n").trim() || null : null;
    }
    payload.additional_fields = fields;
  }
  for (const key of ["addressDetailsVersion", "expectedUpdatedAt"] as const) {
    if (body[key] !== undefined) payload[key] = body[key];
  }
  return callApi(`/address/${encodeURIComponent(id)}`, { method: "PATCH", request, body: payload });
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

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const unauthorized = requireSession(request);
  if (unauthorized) return unauthorized;
  const { id } = await context.params;
  return callApi(`/address/${encodeURIComponent(id)}`, { request });
}
