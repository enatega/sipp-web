import { NextRequest } from "next/server";
import { callApi, requireSession } from "@/services/api/server";
export const dynamic = "force-dynamic";
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const unauthorized = requireSession(request); if (unauthorized) return unauthorized;
  return callApi(`/apps/deliveries/orders/${(await params).id}`, { request });
}
