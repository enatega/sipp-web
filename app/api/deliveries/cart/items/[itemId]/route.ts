import { NextRequest } from "next/server";
import { proxyCartItem } from "@/services/deliveries/cart";

type Context = { params: Promise<{ itemId: string }> };

export async function PATCH(request: NextRequest, context: Context) {
  return proxyCartItem(request, (await context.params).itemId);
}

export async function DELETE(request: NextRequest, context: Context) {
  return proxyCartItem(request, (await context.params).itemId);
}

