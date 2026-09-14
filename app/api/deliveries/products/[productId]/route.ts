import { NextRequest } from "next/server";
import { proxyProductRequest } from "@/services/deliveries/restaurant";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> },
) {
  return proxyProductRequest(request, (await params).productId);
}
