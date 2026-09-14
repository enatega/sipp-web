import { NextResponse } from "next/server";
import { callApi } from "@/services/api/server";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    input?: string;
  } | null;
  const input = body?.input?.trim();

  if (!input) {
    return NextResponse.json({ message: "Input is required." }, { status: 400 });
  }

  return callApi("/maps/places", { method: "POST", body: { input } });
}
