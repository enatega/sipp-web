"use client";

import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useEffect } from "react";
import { authApi } from "@/modules/account/api/auth";
import { locationApi } from "@/modules/account/api/location";
import { paymentApi } from "@/modules/account/api/payment";
import { profileApi } from "@/modules/account/api/profile";
import { securityApi } from "@/modules/account/api/security";
import { accountQueryKeys } from "./queryKeys";
import type {
  NotificationSettingsInput,
  ProfileUpdateInput,
  SessionResponse,
  WalletTopUpPayload,
} from "@/modules/account/types";
import type { AddressPayload } from "@/modules/account/api/location";

export function useSessionQuery() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: accountQueryKeys.session(),
    queryFn: () => authApi.session(),
    staleTime: 60_000,
  });

  useEffect(() => {
    const refresh = () => {
      void queryClient.invalidateQueries({ queryKey: accountQueryKeys.all });
    };
    window.addEventListener("shaaneiol-auth-change", refresh);
    return () => window.removeEventListener("shaaneiol-auth-change", refresh);
  }, [queryClient]);

  return query;
}

export function useEmailExistsMutation() {
  return useMutation({ mutationFn: authApi.emailExists });
}

export function useCountryRegionQuery() {
  return useQuery({
    queryKey: accountQueryKeys.countryRegion(),
    queryFn: authApi.countryRegion,
    staleTime: Infinity,
    retry: false,
  });
}

export function useLoginMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: authApi.login,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: accountQueryKeys.session() }),
  });
}

export function useGoogleLoginMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: authApi.googleLogin,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: accountQueryKeys.session() }),
  });
}

export function useExchangeImpersonationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: authApi.exchangeImpersonation,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: accountQueryKeys.session() }),
  });
}

export function useExitImpersonationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => authApi.exitImpersonation(),
    onSuccess: () => {
      queryClient.setQueryData(accountQueryKeys.session(), {
        authenticated: false,
        user: null,
        impersonation: null,
      });
    },
  });
}

export function useSendPhoneOtpMutation() {
  return useMutation({ mutationFn: authApi.sendPhoneOtp });
}

export function useVerifyPhoneOtpMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: authApi.verifyPhoneOtp,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: accountQueryKeys.session() }),
  });
}

export function useSendSignupOtpMutation() {
  return useMutation({ mutationFn: authApi.sendSignupOtp });
}

export function useVerifySignupOtpMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: authApi.verifySignupOtp,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: accountQueryKeys.session() }),
  });
}

export function useSendForgotPasswordOtpMutation() {
  return useMutation({ mutationFn: authApi.sendForgotPasswordOtp });
}

export function useVerifyForgotPasswordOtpMutation() {
  return useMutation({ mutationFn: authApi.verifyForgotPasswordOtp });
}

export function useResetForgottenPasswordMutation() {
  return useMutation({ mutationFn: authApi.resetForgottenPassword });
}

export function useSendPasswordChangeOtpMutation() {
  return useMutation({ mutationFn: () => securityApi.sendPasswordOtp() });
}

export function useVerifyPasswordChangeOtpMutation() {
  return useMutation({ mutationFn: (otp: string) => securityApi.verifyPasswordOtp(otp) });
}

export function useUpdatePasswordMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: securityApi.updatePassword,
    onSuccess: () => {
      queryClient.clear();
      window.dispatchEvent(new Event("shaaneiol-auth-change"));
    },
  });
}

export function useDeleteAccountMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: securityApi.deleteAccount,
    onSuccess: () => {
      queryClient.clear();
      window.dispatchEvent(new Event("shaaneiol-auth-change"));
    },
  });
}

export function useLogoutMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      queryClient.setQueryData(accountQueryKeys.session(), {
        authenticated: false,
        user: null,
      });
      void queryClient.removeQueries({ queryKey: accountQueryKeys.profile() });
      void queryClient.removeQueries({ queryKey: accountQueryKeys.wallet() });
      void queryClient.removeQueries({
        queryKey: accountQueryKeys.savedCards(),
      });
      void queryClient.removeQueries({
        queryKey: accountQueryKeys.notificationSettings(),
      });
      window.dispatchEvent(new Event("shaaneiol-auth-change"));
    },
  });
}

export function useProfileQuery(enabled = true) {
  return useQuery({
    queryKey: accountQueryKeys.profile(),
    queryFn: () => profileApi.details(),
    enabled,
    staleTime: 60_000,
  });
}

export function useWalletQuery(enabled = true) {
  return useQuery({
    queryKey: accountQueryKeys.wallet(),
    queryFn: () => profileApi.wallet(),
    enabled,
    staleTime: 30_000,
  });
}

export function useWalletTransactionsQuery(enabled = true) {
  return useInfiniteQuery({
    queryKey: accountQueryKeys.walletTransactions(),
    queryFn: ({ pageParam, signal }) =>
      profileApi.walletTransactions(pageParam, signal),
    enabled,
    initialPageParam: 0,
    getNextPageParam: (lastPage) =>
      lastPage.isEnd || lastPage.transactions.length === 0
        ? undefined
        : lastPage.offset + lastPage.transactions.length,
    staleTime: 30_000,
  });
}

export function useSavedCardsQuery(enabled = true) {
  return useQuery({
    queryKey: accountQueryKeys.savedCards(),
    queryFn: ({ signal }) => paymentApi.savedCards(signal),
    enabled,
    staleTime: 30_000,
  });
}

export function useNotificationSettingsQuery(enabled = true) {
  return useQuery({
    queryKey: accountQueryKeys.notificationSettings(),
    queryFn: () => profileApi.notificationSettings(),
    enabled,
    staleTime: 60_000,
  });
}

export function useUpdateNotificationSettingsMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: NotificationSettingsInput) =>
      profileApi.updateNotificationSettings(input),
    onSuccess: (payload) => {
      queryClient.setQueryData(
        accountQueryKeys.notificationSettings(),
        payload,
      );
    },
  });
}

export function useCreateSavedCardSetupIntentMutation() {
  return useMutation({ mutationFn: () => paymentApi.createSetupIntent() });
}

export function useWalletTopUpMutation() {
  return useMutation({
    mutationFn: (input: WalletTopUpPayload) => paymentApi.topUp(input),
  });
}

export function useRemoveSavedCardMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (paymentMethodId: string) =>
      paymentApi.remove(paymentMethodId),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: accountQueryKeys.savedCards(),
      }),
  });
}

export function useSetDefaultSavedCardMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (paymentMethodId: string) =>
      paymentApi.setDefault(paymentMethodId),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: accountQueryKeys.savedCards(),
      }),
  });
}

export function useProfileSummaryQuery(enabled = true) {
  return useQuery({
    queryKey: accountQueryKeys.profileSummary(),
    queryFn: () => profileApi.summary(),
    enabled,
    staleTime: 30_000,
  });
}

export function useUpdateProfileMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ProfileUpdateInput) => profileApi.update(input),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: accountQueryKeys.profile() }),
        queryClient.invalidateQueries({ queryKey: accountQueryKeys.session() }),
      ]);
      window.dispatchEvent(new Event("shaaneiol-auth-change"));
    },
  });
}

export function useUpdateProfileImageMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => profileApi.updateImage(file),
    onSuccess: async (payload) => {
      const imageUrl = payload.data?.image_url?.trim();
      if (imageUrl) {
        queryClient.setQueryData<SessionResponse>(
          accountQueryKeys.session(),
          (current) =>
            current?.authenticated && current.user
              ? {
                  ...current,
                  user: { ...current.user, profile: imageUrl },
                }
              : current,
        );
      }
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: accountQueryKeys.profile() }),
        queryClient.invalidateQueries({ queryKey: accountQueryKeys.session() }),
      ]);
      window.dispatchEvent(new Event("shaaneiol-auth-change"));
    },
  });
}

export function useAddressesQuery(enabled = true) {
  return useQuery({
    queryKey: accountQueryKeys.addresses(),
    queryFn: () => locationApi.savedAddresses(),
    enabled,
    staleTime: 30_000,
  });
}

export function useSaveAddressMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id?: string; payload: AddressPayload }) =>
      id
        ? locationApi.updateAddress(id, payload)
        : locationApi.saveAddress(payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: accountQueryKeys.addresses() }),
        queryClient.invalidateQueries({ queryKey: accountQueryKeys.profile() }),
      ]);
    },
  });
}

export function useDeleteAddressMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => locationApi.deleteAddress(id),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: accountQueryKeys.addresses() }),
        queryClient.invalidateQueries({ queryKey: accountQueryKeys.profile() }),
      ]);
    },
  });
}

export function useSelectAddressMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => locationApi.selectAddress(id),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: accountQueryKeys.addresses() }),
        queryClient.invalidateQueries({ queryKey: accountQueryKeys.profile() }),
      ]);
    },
  });
}

export function usePlaceSearchQuery(input: string, enabled = true) {
  const normalizedInput = input.trim();
  return useQuery({
    queryKey: accountQueryKeys.placeSearch(normalizedInput),
    queryFn: ({ signal }) => locationApi.search(normalizedInput, signal),
    enabled: enabled && normalizedInput.length >= 3,
    staleTime: 5 * 60_000,
  });
}

export function usePlaceDetailsMutation() {
  return useMutation({ mutationFn: locationApi.placeDetails });
}

export function useReverseGeocodeMutation() {
  return useMutation({
    mutationFn: ({ lat, lng }: { lat: number; lng: number }) =>
      locationApi.addressFromPoint(lat, lng),
  });
}
