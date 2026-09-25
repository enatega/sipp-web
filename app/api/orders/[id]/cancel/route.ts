import { NextRequest } from "next/server";
import { callApi, requireSession } from "@/services/api/server";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const unauthorized = requireSession(request);
  if (unauthorized) return unauthorized;
  return callApi(`/apps/deliveries/orders/${(await params).id}/cancel`, {
    method: "PUT",
    request,
  });
}
