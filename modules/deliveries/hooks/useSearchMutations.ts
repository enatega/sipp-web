"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { searchApi } from "@/modules/deliveries/api/search";
import { deliveryQueryKeys } from "@/modules/deliveries/queries/queryKeys";

export function useSaveRecentSearchMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (term: string) => searchApi.recentSearches.save(term),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: deliveryQueryKeys.recentSearches() });
    },
  });
}

export function useRemoveRecentSearchMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => searchApi.recentSearches.remove(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: deliveryQueryKeys.recentSearches() });
    },
  });
}

export function useClearRecentSearchesMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => searchApi.recentSearches.clear(),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: deliveryQueryKeys.recentSearches() });
    },
  });
}
