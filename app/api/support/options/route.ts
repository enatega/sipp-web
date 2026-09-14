import { NextRequest } from "next/server";
import { callApi, requireSession } from "@/services/api/server";
export function GET(request: NextRequest) {
  return requireSession(request) ?? callApi("/deliveries/support-tickets/options", { request });
}
