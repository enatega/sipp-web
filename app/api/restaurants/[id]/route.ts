import { NextRequest } from "next/server";
import { proxyRestaurantRequest } from "@/services/deliveries/restaurant";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  return proxyRestaurantRequest(request, (await params).id);
}
