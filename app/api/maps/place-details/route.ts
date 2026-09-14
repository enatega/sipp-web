import { NextResponse } from "next/server";
import { callApi } from "@/services/api/server";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    placeId?: string;
  } | null;
  const placeId = body?.placeId?.trim();

  if (!placeId) {
    return NextResponse.json(
      { message: "placeId is required." },
      { status: 400 },
    );
  }

  return callApi("/maps/place-details", { method: "POST", body: { placeId } });
}
