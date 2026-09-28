"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { io } from "socket.io-client";
import { notificationInboxKeys } from "@/modules/account/queries/useNotificationInboxQueries";

interface SocketSession {
  token: string;
  userId: string;
  url: string;
  path: string;
}

export function useNotificationLiveSync() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const controller = new AbortController();
    let socket: ReturnType<typeof io> | null = null;
    const refresh = () => {
      void queryClient.invalidateQueries({ queryKey: notificationInboxKeys.all });
    };

    void fetch("/api/deliveries/socket-session", {
      credentials: "same-origin",
      cache: "no-store",
      signal: controller.signal,
    }).then(async (response) => {
      if (!response.ok) return null;
      return response.json() as Promise<SocketSession>;
    }).then((session) => {
      if (!session || controller.signal.aborted) return;
      socket = io(session.url, {
        auth: { token: session.token },
        autoConnect: false,
        path: session.path,
        transports: ["websocket"],
      });
      socket.on("connect", () => {
        socket?.emit("add-user", session.userId);
        refresh();
      });
      socket.on("order-status-updated", refresh);
      socket.on("notification-created", refresh);
      socket.connect();
    }).catch(() => {
      // The unread query keeps polling when the socket is unavailable.
    });

    const onVisible = () => {
      if (document.visibilityState !== "visible") return;
      refresh();
      if (socket && !socket.connected) socket.connect();
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onVisible);
    window.addEventListener("online", onVisible);
    return () => {
      controller.abort();
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onVisible);
      window.removeEventListener("online", onVisible);
      socket?.disconnect();
    };
  }, [queryClient]);
}
