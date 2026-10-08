import { NextRequest } from "next/server";
import { proxyPlaceOrder, proxyPlacedOrderByBucket } from "@/services/deliveries/checkout";

export function GET(request: NextRequest) {
  return proxyPlacedOrderByBucket(request);
}

export function POST(request: NextRequest) {
  return proxyPlaceOrder(request);
}
