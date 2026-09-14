import { NextRequest } from "next/server";
import { proxyCartCollection } from "@/services/deliveries/cart";

export function GET(request: NextRequest) {
  return proxyCartCollection(request);
}

export function POST(request: NextRequest) {
  return proxyCartCollection(request);
}

export function DELETE(request: NextRequest) {
  return proxyCartCollection(request);
}
