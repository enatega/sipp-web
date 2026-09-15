import { NextRequest } from "next/server";
import { callApi, requireSession } from "@/services/api/server";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const unauthorized = requireSession(request);
  if (unauthorized) return unauthorized;

  const { id } = await context.params;
  return callApi(`/apps/deliveries/profile/address/${encodeURIComponent(id)}/select`, {
    method: "PATCH",
    request,
  });
}
