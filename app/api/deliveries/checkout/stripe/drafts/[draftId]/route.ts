import { NextRequest } from "next/server";
import { proxyStripeOrderStatus } from "@/services/deliveries/checkout";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ draftId: string }> },
) {
  const { draftId } = await context.params;
  return proxyStripeOrderStatus(request, draftId);
}
