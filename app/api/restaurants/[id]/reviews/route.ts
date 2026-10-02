import { NextRequest } from "next/server";
import { proxyRestaurantReviewsRequest } from "@/services/deliveries/restaurant";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  return proxyRestaurantReviewsRequest(request, (await params).id);
}
