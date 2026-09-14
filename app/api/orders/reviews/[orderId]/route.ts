import { NextRequest } from "next/server";
import { callApi, requireSession } from "@/services/api/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> },
) {
  const unauthorized = requireSession(request);
  if (unauthorized) return unauthorized;
  const { orderId } = await params;
  return callApi(`/apps/delivery-reviews/order/${orderId}`, {
    method: "GET",
    request,
  });
}
