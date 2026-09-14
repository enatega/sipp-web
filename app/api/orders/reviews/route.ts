import { NextRequest } from "next/server";
import { callApi, requireSession } from "@/services/api/server";
export async function POST(request: NextRequest) {
  const unauthorized = requireSession(request); if (unauthorized) return unauthorized;
  const body = await request.json();
  return callApi("/apps/delivery-reviews/", { method: "POST", body, request });
}
