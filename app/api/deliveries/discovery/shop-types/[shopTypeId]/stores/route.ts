import { NextRequest, NextResponse } from "next/server";
import {
  isUuid,
  proxyDiscoveryRequest,
} from "@/services/deliveries/discovery";

export const dynamic = "force-dynamic";

interface RouteProps {
  params: Promise<{ shopTypeId: string }>;
}

export async function GET(request: NextRequest, { params }: RouteProps) {
  const { shopTypeId } = await params;
  if (!isUuid(shopTypeId)) {
    return NextResponse.json(
      { message: "Invalid shop type identifier." },
      { status: 400 },
    );
  }
  return proxyDiscoveryRequest(
    request,
    `/apps/deliveries/discovery/shop-types/${shopTypeId}/stores`,
    { acceptsLocation: true, acceptsFilters: true, requiresAuth: false },
  );
}
