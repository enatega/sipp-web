import { NextRequest } from "next/server";
import { proxyDiscoveryRequest } from "@/services/deliveries/discovery";

export const dynamic = "force-dynamic";

export function GET(request: NextRequest) {
  return proxyDiscoveryRequest(
    request,
    "/apps/deliveries/discovery/public/nearby-stores",
    { requiresLocation: true, acceptsFilters: true, requiresAuth: false },
  );
}
