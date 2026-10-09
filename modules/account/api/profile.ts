import { apiRoutes } from "@/config/api";
import { postJson, requestJson } from "@/services/api/client";
import type {
  ProfilePayload,
  ProfileImageUpdatePayload,
  ProfileSummaryPayload,
  ProfileUpdateInput,
  ProfileUpdatePayload,
  WalletPayload,
  WalletTransactionsPayload,
} from "@/modules/account/types";
import type {
  NotificationSettingsInput,
  NotificationSettingsPayload,
} from "@/modules/account/types";

export const profileApi = {
  sendPhoneVerification(payload: { phone: string }) {
    return postJson<{ message: string }>("/api/profile/phone/send", payload);
  },
  verifyPhoneVerification(payload: { phone: string; otp: string }) {
    return postJson<{ message: string }>("/api/profile/phone/verify", payload);
  },
  details() {
    return requestJson<ProfilePayload>(apiRoutes.profile, { cache: "no-store" });
  },
  update(payload: ProfileUpdateInput) {
    return requestJson<ProfileUpdatePayload>(apiRoutes.profile, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },
  updateImage(file: File) {
    const form = new FormData();
    form.set("image", file, file.name);
    return requestJson<ProfileImageUpdatePayload>(apiRoutes.profileImage, {
      method: "PATCH",
      body: form,
      timeoutMs: 60_000,
    });
  },
  wallet() {
    return requestJson<WalletPayload>(apiRoutes.profileWallet, {
      cache: "no-store",
    });
  },
  walletTransactions(offset = 0, signal?: AbortSignal) {
    const query = new URLSearchParams({
      offset: String(offset),
      limit: "10",
    });
    return requestJson<WalletTransactionsPayload>(
      `${apiRoutes.profileWalletTransactions}?${query.toString()}`,
      { cache: "no-store", signal },
    );
  },
  summary() {
    return requestJson<ProfileSummaryPayload>(apiRoutes.profileSummary, {
      cache: "no-store",
    });
  },
  notificationSettings() {
    return requestJson<NotificationSettingsPayload>(
      apiRoutes.notificationSettings,
      { cache: "no-store" },
    );
  },
  updateNotificationSettings(payload: NotificationSettingsInput) {
    return requestJson<NotificationSettingsPayload>(
      apiRoutes.notificationSettings,
      { method: "PATCH", body: JSON.stringify(payload) },
    );
  },
};
