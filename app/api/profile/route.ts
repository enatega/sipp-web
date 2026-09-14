import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { callApi, requireSession } from "@/services/api/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const unauthorized = requireSession(request);
  if (unauthorized) return unauthorized;

  return callApi("/apps/deliveries/profile", { request });
}

export async function PATCH(request: NextRequest) {
  const unauthorized = requireSession(request);
  if (unauthorized) return unauthorized;

  const body = (await request.json().catch(() => null)) as {
    name?: unknown;
    dateOfBirth?: unknown;
    gender?: unknown;
  } | null;
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const dateOfBirth =
    typeof body?.dateOfBirth === "string" ? body.dateOfBirth : undefined;
  const gender =
    body?.gender === "MALE" || body?.gender === "FEMALE" || body?.gender === "OTHER"
      ? body.gender
      : undefined;

  if (!name || name.length > 120 || !/^[a-zA-Z\s]+$/.test(name)) {
    return NextResponse.json(
      { message: "Enter a valid name using letters and spaces." },
      { status: 400 },
    );
  }

  if (dateOfBirth && Number.isNaN(Date.parse(dateOfBirth))) {
    return NextResponse.json(
      { message: "Enter a valid date of birth." },
      { status: 400 },
    );
  }

  return callApi("/apps/deliveries/profile", {
    request,
    method: "PATCH",
    body: { name, dateOfBirth, gender },
  });
}
