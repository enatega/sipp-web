import { NextRequest } from "next/server";
import { proxyRecentSearchMutation } from "@/services/deliveries/search";

export const dynamic = "force-dynamic";

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  return proxyRecentSearchMutation(request, "DELETE", id);
}
