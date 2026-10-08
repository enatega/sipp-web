"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { io, type Socket } from "socket.io-client";
import { useSessionQuery } from "@/modules/account";
import { deliveryQueryKeys } from "../../queries/queryKeys";
import { FloatingOrderTracker } from "./FloatingOrderTracker";

interface SocketSession { token: string; userId: string; url: string; path: string }
interface SocketConnection { socket: Socket; userId: string }
const OrderSocketContext = createContext<SocketConnection | null>(null);

function isSocketSession(value: unknown): value is SocketSession {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const candidate = value as Partial<SocketSession>;
  return typeof candidate.token === "string" && typeof candidate.userId === "string"
    && typeof candidate.url === "string" && typeof candidate.path === "string";
}

export function useCustomerOrderSocket() {
  return useContext(OrderSocketContext);
}

export function CustomerOrderLiveConnection({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const session = useSessionQuery();
  const authenticated = session.data?.authenticated === true;
  const isOrderDetailPage = /^\/orders\/[^/]+\/?$/.test(pathname ?? "");
  const queryClient = useQueryClient();
  const [connection, setConnection] = useState<SocketConnection | null>(null);

  useEffect(() => {
    if (!authenticated) return;
    const controller = new AbortController();
    let socket: Socket | null = null;
    let starting = false;
    async function start() {
      if (starting || socket || controller.signal.aborted) return;
      starting = true;
      try {
        const response = await fetch("/api/deliveries/socket-session", {
          cache: "no-store", credentials: "same-origin", signal: controller.signal,
        });
        if (!response.ok) return;
        const payload: unknown = await response.json();
        if (!isSocketSession(payload) || controller.signal.aborted) return;
        const liveSocket = io(payload.url, {
          auth: { token: payload.token }, autoConnect: false,
          path: payload.path, transports: ["websocket"],
        });
        socket = liveSocket;
        liveSocket.on("connect", () => {
          liveSocket.emit("add-user", payload.userId);
          void queryClient.invalidateQueries({ queryKey: deliveryQueryKeys.orders() });
        });
        liveSocket.on("order-status-updated", (event: { orderId?: string }) => {
          void queryClient.invalidateQueries({ queryKey: deliveryQueryKeys.orders() });
          if (event?.orderId) void queryClient.invalidateQueries({ queryKey: deliveryQueryKeys.order(event.orderId) });
        });
        liveSocket.on("connect_error", () => {
          liveSocket.disconnect();
          if (socket === liveSocket) socket = null;
          setConnection(null);
        });
        setConnection({ socket: liveSocket, userId: payload.userId });
        if (document.visibilityState !== "hidden") liveSocket.connect();
      } catch {
        // Order queries continue polling and the next retry may reconnect.
      } finally {
        starting = false;
      }
    }
    const onVisibility = () => {
      if (document.visibilityState === "hidden") socket?.disconnect();
      else if (socket) socket.connect();
      else void start();
    };
    const onOnline = () => { if (socket) socket.connect(); else void start(); };
    void start();
    const retry = window.setInterval(() => { if (!socket) void start(); }, 30_000);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("online", onOnline);
    return () => {
      controller.abort();
      window.clearInterval(retry);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("online", onOnline);
      socket?.disconnect();
      setConnection(null);
    };
  }, [authenticated, queryClient]);

  return <OrderSocketContext.Provider value={connection}>
    {children}
    {authenticated && !isOrderDetailPage ? <FloatingOrderTracker /> : null}
  </OrderSocketContext.Provider>;
}
