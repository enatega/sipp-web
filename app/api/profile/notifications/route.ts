import { NextRequest } from "next/server";
import { callApi, requireSession } from "@/services/api/server";

const FIELDS = [
  "food_delivery_email",
  "food_delivery_sms",
  "food_delivery_whatsapp",
  "marketing_email",
  "marketing_sms",
  "marketing_whatsapp",
] as const;

function notificationBody(body: unknown) {
  if (!body || typeof body !== "object") return null;
  const source = body as Record<string, unknown>;
  const result: Partial<Record<(typeof FIELDS)[number], boolean>> = {};
  for (const field of FIELDS) {
    if (typeof source[field] !== "boolean") return null;
    result[field] = source[field];
  }
  return result;
}

export async function GET(request: NextRequest) {
  const unauthorized = requireSession(request);
  if (unauthorized) return unauthorized;
  return callApi("/apps/deliveries/settings/notifications", { request });
}

export async function PATCH(request: NextRequest) {
  const unauthorized = requireSession(request);
  if (unauthorized) return unauthorized;
  const body = notificationBody(await request.json().catch(() => null));
  if (!body) {
    return Response.json(
      { message: "Notification preferences are incomplete." },
      { status: 400 },
    );
  }
  return callApi("/apps/deliveries/settings/notifications", {
    method: "PATCH",
    request,
    body,
  });
}
