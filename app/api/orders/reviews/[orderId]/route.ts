import { NextRequest } from "next/server";
import { callApi, requireSession } from "@/services/api/server";
import { invalidIdentifier, isUuid } from "@/services/api/request-security";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> },
) {
  const unauthorized = requireSession(request);
  if (unauthorized) return unauthorized;
  const { orderId } = await params;
  if (!isUuid(orderId)) return invalidIdentifier();
  return callApi(`/apps/delivery-reviews/order/${encodeURIComponent(orderId)}`, {
    method: "GET",
    request,
  });
}
