import { apiRoutes } from "@/config/api";
import { requestJson } from "@/services/api/client";
import type {
  ActiveCurrency,
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
  activeCurrency(signal?: AbortSignal) {
    return requestJson<ActiveCurrency | null>(apiRoutes.currency, {
      cache: "no-store",
      signal,
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
