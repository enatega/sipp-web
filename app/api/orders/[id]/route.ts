import { NextRequest } from "next/server";
import { callApi, requireSession } from "@/services/api/server";
import { invalidIdentifier, isUuid } from "@/services/api/request-security";
export const dynamic = "force-dynamic";
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const unauthorized = requireSession(request); if (unauthorized) return unauthorized;
  const { id } = await params;
  if (!isUuid(id)) return invalidIdentifier();
  return callApi(`/apps/deliveries/orders/${encodeURIComponent(id)}`, { request });
}
