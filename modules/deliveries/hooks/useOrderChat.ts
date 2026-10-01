"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { orderChatApi } from "../api/orderChat";
import { deliveryQueryKeys } from "../queries/queryKeys";

export function useOrderChatThread(orderId: string, enabled: boolean) {
  return useQuery({
    queryKey: deliveryQueryKeys.orderChat(orderId),
    queryFn: ({ signal }) => orderChatApi.thread(orderId, signal),
    enabled: enabled && Boolean(orderId),
    refetchInterval: enabled ? 10_000 : false,
    staleTime: 5_000,
  });
}

export function useOrderChatUnread(enabled: boolean) {
  return useQuery({
    queryKey: deliveryQueryKeys.orderChatUnread(),
    queryFn: ({ signal }) => orderChatApi.unread(signal),
    enabled,
    refetchInterval: enabled ? 15_000 : false,
    staleTime: 5_000,
  });
}

export function useSendOrderChatMessage(orderId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (text: string) => orderChatApi.send(orderId, text),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: deliveryQueryKeys.orderChat(orderId) }),
  });
}

export function useMarkOrderChatRead(orderId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => orderChatApi.markRead(orderId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: deliveryQueryKeys.orderChatUnread() }),
  });
}
