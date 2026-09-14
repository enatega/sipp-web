"use client";

import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationInboxApi } from "@/modules/account/api/notificationInbox";

export const notificationInboxKeys = {
  all: ["account", "notification-inbox"] as const,
  period: (period: "today" | "past") => [...notificationInboxKeys.all, period] as const,
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

export function useMarkAllNotificationsReadMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: notificationInboxApi.markAllRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: notificationInboxKeys.all }),
  });
}
