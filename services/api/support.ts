import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { ValidationError } from "yup";
import { ticketInputSchema } from "@/modules/deliveries/types/support";
import { callApi, requireSession } from "./server";

export async function supportTickets(request: NextRequest) {
  const denied = requireSession(request);
  if (denied) return denied;
  if (request.method === "GET") return callApi("/deliveries/support-tickets/my-tickets", { request });
  try {
    const body = await ticketInputSchema.validate(await request.json(), { stripUnknown: true });
    return callApi("/deliveries/support-tickets", { request, method: "POST", body });
  } catch (error) {
    return NextResponse.json({ message: "Invalid ticket details." }, { status: error instanceof ValidationError || error instanceof SyntaxError ? 400 : 503 });
  }
}

export async function supportChat(request: NextRequest, id: string) {
  const denied = requireSession(request);
  if (denied) return denied;
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    return NextResponse.json({ message: "Invalid conversation." }, { status: 400 });
  }
  if (request.method === "GET") {
    return callApi(`/deliveries/support-chat-app/conversations/${id}/messages`, { request });
  }
  const body: unknown = await request.json().catch(() => null);
  const text = body && typeof body === "object" && "text" in body && typeof body.text === "string" ? body.text.trim() : "";
  if (!text || text.length > 5000) return NextResponse.json({ message: "Invalid message." }, { status: 400 });
  return callApi("/deliveries/support-chat-app/send-to-chat-box", { request, method: "POST", body: { chatBoxId: id, text } });
}
