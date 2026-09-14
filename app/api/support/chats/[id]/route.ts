import { NextRequest } from "next/server";
import { supportChat } from "@/services/api/support";
export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  return supportChat(request, (await context.params).id);
}
export const POST = GET;
