"use client";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { io } from "socket.io-client";
import { supportApi } from "../api/support";
import { deliveryQueryKeys as keys } from "../queries/queryKeys";
import type { SupportTickets } from "../types/support";

export function useSupport(userId: string, chatId: string) {
  const client = useQueryClient();
  const [isLive, setIsLive] = useState(false);
  const tickets = useQuery({ queryKey: keys.supportTickets(userId), queryFn: ({ signal }) => supportApi.tickets(signal), enabled: !!userId, staleTime: 10000 });
  const thread = useQuery({ queryKey: keys.supportThread(userId, chatId), queryFn: ({ signal }) => supportApi.thread(chatId, signal), enabled: !!userId && !!chatId });
  const create = useMutation({ mutationFn: supportApi.create, onSuccess: () => client.invalidateQueries({ queryKey: keys.supportTickets(userId) }) });
  const send = useMutation({ mutationFn: ({ id, text, attachmentUrls }: { id: string; text: string; attachmentUrls?: string[] }) => supportApi.send(id, text, attachmentUrls), onSuccess: async (_, { id }) => {
    await Promise.all([client.invalidateQueries({ queryKey: keys.supportThread(userId, id) }), client.invalidateQueries({ queryKey: keys.supportTickets(userId) })]);
  } });
  // Fetching a ticket's thread marks its unread messages read server-side;
  // refresh the ticket list so its unread badge clears.
  useEffect(() => {
    if (!thread.isSuccess) return;
    void client.invalidateQueries({ queryKey: keys.supportTickets(userId) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [thread.isSuccess, thread.dataUpdatedAt, userId]);
  useEffect(() => {
    if (!userId) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let closed = false;
    let socket: ReturnType<typeof io> | undefined;
    const refresh = () => {
      if (timer) return;
      timer = setTimeout(() => { timer = undefined; void client.invalidateQueries({ queryKey: keys.support(userId) }); }, 150);
    };
    void fetch("/api/support/socket-session", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error("Unable to start support socket");
        return response.json() as Promise<{ token: string; userId: string; url: string; path: string }>;
      })
      .then((session) => {
        if (closed) return;
        socket = io(session.url, { transports: ["websocket"], autoConnect: false, path: session.path, auth: { token: session.token } });
        socket.on("connect", () => {
          socket?.emit("add-user", session.userId);
          setIsLive(true);
          refresh();
        });
        socket.on("disconnect", () => setIsLive(false));
        socket.on("connect_error", () => setIsLive(false));
        socket.on("support-updated", (payload: { chatBoxId?: string; message?: { sender_id?: string } } | undefined) => {
          if (payload?.chatBoxId && payload.chatBoxId !== chatId && payload.message?.sender_id !== userId) {
            client.setQueryData<SupportTickets>(keys.supportTickets(userId), (current) => current ? {
              ...current,
              tickets: current.tickets.map((ticket) => ticket.chatBoxId === payload.chatBoxId ? { ...ticket, unreadCount: ticket.unreadCount + 1 } : ticket),
            } : current);
          }
          refresh();
        });
        socket.on("receive-message", refresh);
        socket.connect();
      })
      .catch(() => setIsLive(false));

    return () => {
      closed = true;
      socket?.disconnect();
      clearTimeout(timer);
      setIsLive(false);
    };
  }, [chatId, client, userId]);
  return { tickets, thread, create, send, isLive };
}
