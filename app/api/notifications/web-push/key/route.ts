import { NextRequest } from "next/server";
import { callApi, requireSession } from "@/services/api/server";

export function GET(request: NextRequest) {
  const rejected = requireSession(request);
  if (rejected) return rejected;
  return callApi("/apps/deliveries/web-push/key", { request });
}
