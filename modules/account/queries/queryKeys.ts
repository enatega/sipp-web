export const accountQueryKeys = {
  all: ["account"] as const,
  session: () => [...accountQueryKeys.all, "session"] as const,
  profile: () => [...accountQueryKeys.all, "profile"] as const,
  profileSummary: () => [...accountQueryKeys.profile(), "summary"] as const,
  wallet: () => [...accountQueryKeys.all, "wallet"] as const,
  walletTransactions: () =>
    [...accountQueryKeys.wallet(), "transactions"] as const,
  currency: () => [...accountQueryKeys.all, "currency"] as const,
  savedCards: () => [...accountQueryKeys.all, "saved-cards"] as const,
  notificationSettings: () =>
    [...accountQueryKeys.all, "notification-settings"] as const,
  addresses: () => [...accountQueryKeys.all, "addresses"] as const,
  placeSearch: (input: string) =>
    [...accountQueryKeys.all, "places", "search", input] as const,
};
