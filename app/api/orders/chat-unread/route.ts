import { NextRequest } from "next/server";
import { callApi, requireSession } from "@/services/api/server";

export async function GET(request: NextRequest) {
  const unauthorized = requireSession(request);
  if (unauthorized) return unauthorized;
  return callApi("/apps/deliveries/chat/order-unread", { request });
}
