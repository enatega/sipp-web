import { NextRequest } from "next/server";
import { proxyCheckoutPreview } from "@/services/deliveries/checkout";

export function GET(request: NextRequest) {
  return proxyCheckoutPreview(request);
}


export { proxyCheckoutPreviewBody as POST } from "@/services/deliveries/checkout";
