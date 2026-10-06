import { NextRequest, NextResponse } from "next/server";
import { isUuid, proxyDiscoveryRequest } from "@/services/deliveries/discovery";

export const dynamic = "force-dynamic";

interface RouteProps {
  params: Promise<{ foodId: string }>;
}

export async function GET(request: NextRequest, { params }: RouteProps) {
  const { foodId } = await params;
  if (!isUuid(foodId)) {
    return NextResponse.json({ message: "Invalid Favourite Food identifier." }, { status: 400 });
  }

  return proxyDiscoveryRequest(
    request,
    `/apps/deliveries/discovery/favourite-foods/${foodId}/products`,
    { acceptsLocation: true, acceptsShopType: true, requiresAuth: false },
  );
}
