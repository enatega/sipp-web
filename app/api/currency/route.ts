import { NextRequest } from "next/server";

import { callApi } from "@/services/api/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  return callApi("/apps/deliveries/currency", { request });
}
