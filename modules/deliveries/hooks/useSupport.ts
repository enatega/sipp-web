"use client";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supportApi } from "../api/support";
import { deliveryQueryKeys as keys } from "../queries/queryKeys";

export function useSupport(userId: string, chatId: string) {
  const client = useQueryClient();
  const [isLive, setIsLive] = useState(false);
  // Real-time updates arrive via the support-updated push (see the
  // EventSource effect below), so polling only serves as a fallback while
  // that channel is down.
  const tickets = useQuery({ queryKey: keys.supportTickets(userId), queryFn: ({ signal }) => supportApi.tickets(signal), enabled: !!userId, staleTime: 10000, refetchInterval: isLive ? false : 15000 });
  const thread = useQuery({ queryKey: keys.supportThread(userId, chatId), queryFn: ({ signal }) => supportApi.thread(chatId, signal), enabled: !!userId && !!chatId, refetchInterval: isLive ? false : 5000 });
  const create = useMutation({ mutationFn: supportApi.create, onSuccess: () => client.invalidateQueries({ queryKey: keys.supportTickets(userId) }) });
  const send = useMutation({ mutationFn: ({ id, text }: { id: string; text: string }) => supportApi.send(id, text), onSuccess: async (_, { id }) => {
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
    const events = new EventSource("/api/support/events");
    let timer: ReturnType<typeof setTimeout> | undefined;
    const refresh = () => {
      if (timer) return;
      timer = setTimeout(() => { timer = undefined; void client.invalidateQueries({ queryKey: keys.support(userId) }); }, 150);
    };
    events.addEventListener("ready", () => { setIsLive(true); refresh(); });
    events.addEventListener("support-updated", refresh);
    events.addEventListener("reconnecting", () => setIsLive(false));
    events.onerror = () => setIsLive(false);
    return () => { events.close(); clearTimeout(timer); setIsLive(false); };
  }, [client, userId]);
  return { tickets, thread, create, send, isLive };
}
