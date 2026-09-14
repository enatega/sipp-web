import { getPublicApi } from "@/services/api/server";

export const dynamic = "force-dynamic";

export function GET() {
  return getPublicApi("/apps/deliveries/vendor-applications/options");
}
