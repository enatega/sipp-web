import { NextRequest, NextResponse } from "next/server";
import { callApi, requireSession } from "@/services/api/server";

type Context = { params: Promise<{ id: string }> };

function orderChatPath(id: string) {
  return `/apps/deliveries/chat/order/${encodeURIComponent(id)}/customer_rider`;
}

export async function GET(request: NextRequest, { params }: Context) {
  const unauthorized = requireSession(request);
  if (unauthorized) return unauthorized;
  return callApi(orderChatPath((await params).id), { request });
}

export async function POST(request: NextRequest, { params }: Context) {
  const unauthorized = requireSession(request);
  if (unauthorized) return unauthorized;
  const payload: unknown = await request.json().catch(() => null);
  const text = payload && typeof payload === "object" && "text" in payload
    ? (payload as { text?: unknown }).text
    : null;
  const attachmentUrls = payload && typeof payload === "object" && "attachmentUrls" in payload
    ? (payload as { attachmentUrls?: unknown }).attachmentUrls
    : [];
  if (typeof text !== "string" || text.trim().length > 4000 || !Array.isArray(attachmentUrls) || attachmentUrls.length > 5 || !attachmentUrls.every((url) => typeof url === "string" && url.length < 2048) || (!text.trim() && attachmentUrls.length === 0)) {
    return NextResponse.json({ message: "Add a message or up to five photos." }, { status: 400 });
  }
  return callApi(`${orderChatPath((await params).id)}/send`, {
    method: "POST",
    body: { text: text.trim(), attachmentUrls },
    request,
  });
}

export async function PATCH(request: NextRequest, { params }: Context) {
  const unauthorized = requireSession(request);
  if (unauthorized) return unauthorized;
  return callApi(`${orderChatPath((await params).id)}/read`, {
    method: "PATCH",
    request,
  });
}
