import { NextRequest } from "next/server";
import { proxyPlaceOrder } from "@/services/deliveries/checkout";

export function POST(request: NextRequest) {
  return proxyPlaceOrder(request);
}

