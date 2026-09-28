"use client";

import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notificationInboxApi } from "@/modules/account/api/notificationInbox";

export const notificationInboxKeys = {
  all: ["account", "notification-inbox"] as const,
  period: (period: "today" | "past") => [...notificationInboxKeys.all, period] as const,
  unreadCount: () => [...notificationInboxKeys.all, "unread-count"] as const,
};

export function useNotificationInboxQuery(period: "today" | "past", enabled = true) {
  return useInfiniteQuery({
    queryKey: notificationInboxKeys.period(period),
    queryFn: ({ pageParam, signal }) => notificationInboxApi.list(period, pageParam, signal),
    initialPageParam: 0,
    enabled,
    staleTime: 60_000,
    getNextPageParam: (lastPage) => lastPage.isEnd ? undefined : lastPage.nextOffset ?? undefined,
  });
}

export function useUnreadNotificationsCountQuery(enabled = true) {
  return useQuery({
    queryKey: notificationInboxKeys.unreadCount(),
    queryFn: ({ signal }) => notificationInboxApi.unreadCount(signal),
    enabled,
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
  });
}

export function useMarkNotificationReadMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: notificationInboxApi.markRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: notificationInboxKeys.all }),
  });
}

export function useMarkAllNotificationsReadMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: notificationInboxApi.markAllRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: notificationInboxKeys.all }),
  });
}
