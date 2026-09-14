import { NextRequest } from "next/server";
import { callApi, requireSession } from "@/services/api/server";

export async function POST(request: NextRequest) {
  const unauthorized = requireSession(request);
  if (unauthorized) return unauthorized;

  return callApi("/apps/deliveries/wallet/saved-cards/setup-intent", {
    method: "POST",
    request,
    body: {},
  });
}
