import { NextRequest } from "next/server";
import { resolveRestaurantSlug } from "@/services/deliveries/restaurant";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  return resolveRestaurantSlug(request, (await params).slug);
}
