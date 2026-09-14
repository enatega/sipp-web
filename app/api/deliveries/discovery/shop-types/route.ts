import { NextRequest } from "next/server";
import { proxyDiscoveryRequest } from "@/services/deliveries/discovery";

export const dynamic = "force-dynamic";

export function GET(request: NextRequest) {
  return proxyDiscoveryRequest(
    request,
    "/apps/deliveries/discovery/public/shop-types",
    { requiresAuth: false },
  );
}
