import { getPublicApi } from "@/services/api/server";

export async function GET() {
  return getPublicApi("/apps/deliveries/languages");
}
