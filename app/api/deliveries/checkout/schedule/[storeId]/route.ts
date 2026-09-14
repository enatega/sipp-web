import { NextRequest } from "next/server";
import { proxyCheckoutSchedule } from "@/services/deliveries/checkout";

type Context = { params: Promise<{ storeId: string }> };

export async function GET(request: NextRequest, context: Context) {
  return proxyCheckoutSchedule(request, (await context.params).storeId);
}
