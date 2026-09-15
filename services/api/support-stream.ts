import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { io } from "socket.io-client";
import { callApi, requireSession } from "./server";

export async function supportStream(request: NextRequest) {
  const denied = requireSession(request);
  if (denied) return denied;
  // Resolve the room from an authenticated upstream response, never a browser ID.
  const profile = await callApi("/apps/deliveries/profile", { request });
  if (!profile.ok) return profile;
  const body = await profile.json();
  const userId = body?.data?.user?.id;
  if (typeof userId !== "string" || !userId) return NextResponse.json({ message: "Sign in to continue." }, { status: 401 });
  const origin = new URL(process.env.SHAANIEOL_API_BASE_URL ?? "http://localhost:8080/api/v1").origin;
  let cleanup = () => {};
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const encoder = new TextEncoder();
      let closed = false;
      const socket = io(`${origin}/deliveries`, { transports: ["websocket"], autoConnect: false, reconnection: true });
      const write = (event: string, data: unknown) => {
        if (!closed) controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
      };
      const heartbeat = setInterval(() => write("heartbeat", {}), 15000);
      // Rotate periodically so an expired session is revalidated on reconnect.
      const lifetime = setTimeout(() => cleanup(), 240000);
      cleanup = () => {
        if (closed) return;
        closed = true;
        clearInterval(heartbeat);
        clearTimeout(lifetime);
        socket.disconnect();
        request.signal.removeEventListener("abort", cleanup);
        controller.close();
      };
      socket.on("connect", () => { socket.emit("add-user", userId); write("ready", {}); });
      socket.on("disconnect", () => write("reconnecting", {}));
      socket.on("connect_error", () => write("reconnecting", {}));
      // Invalidate and re-read persisted messages; socket payloads are not trusted chat history.
      socket.on("support-updated", () => write("support-updated", {}));
      socket.on("receive-message", () => write("support-updated", {}));
      request.signal.addEventListener("abort", cleanup, { once: true });
      if (request.signal.aborted) cleanup();
      else socket.connect();
    },
    cancel() { cleanup(); },
  });
  return new Response(stream, { headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache, no-transform", "X-Accel-Buffering": "no" } });
}
