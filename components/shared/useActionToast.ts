"use client";

import { useCallback, useMemo } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { ApiError } from "@/services/api/client";

/** Keys of the `toasts` message namespace; keep in sync with messages/*.json. */
export type ToastKey =
  | "profileUpdated" | "profileUpdateFailed"
  | "photoUpdated" | "photoUpdateFailed"
  | "notificationsSaved" | "notificationsSaveFailed"
  | "addressAdded" | "addressUpdated" | "addressSaveFailed"
  | "addressDeleted" | "addressDeleteFailed"
  | "deliveryAddressChanged" | "deliveryAddressChangeFailed"
  | "cardAdded" | "cardAddFailed"
  | "cardRemoved" | "cardRemoveFailed"
  | "defaultCardUpdated" | "defaultCardUpdateFailed"
  | "walletToppedUp" | "walletTopUpFailed"
  | "couponClaimed" | "couponClaimFailed"
  | "couponActivated" | "couponDeactivated" | "couponUpdateFailed"
  | "codeSent" | "codeSendFailed" | "codeVerifyFailed"
  | "passwordUpdated" | "passwordUpdateFailed"
  | "accountDeleted" | "accountDeleteFailed"
  | "addedToFavourites" | "removedFromFavourites" | "favouriteUpdateFailed"
  | "allNotificationsRead" | "notificationsReadFailed"
  | "offline" | "timeout" | "rateLimited" | "sessionExpired";

const MAX_SERVER_MESSAGE_LENGTH = 140;
const TECHNICAL_MESSAGE =
  /exception|error:|undefined|null|stack|sql|typeorm|internal|\bat\s+\w+\s*\(|[{}[\]<>]/i;

/**
 * Upstream validation messages ("This coupon has already been claimed") help
 * the user; stack traces, enum dumps and bracketed payloads do not. Only a
 * short, sentence-like client error (4xx) is surfaced as the toast detail.
 */
function readableServerMessage(error: unknown): string | undefined {
  if (!(error instanceof ApiError)) return undefined;
  if (error.status < 400 || error.status >= 500) return undefined;
  const message = error.message.trim();
  if (!message || message.length > MAX_SERVER_MESSAGE_LENGTH) return undefined;
  return TECHNICAL_MESSAGE.test(message) ? undefined : message;
}

function isOffline(error: unknown) {
  return (
    (typeof navigator !== "undefined" && navigator.onLine === false) ||
    (error instanceof TypeError && /fetch|network/i.test(error.message))
  );
}

/**
 * One place for the account-wide success/error toast policy, so every action
 * reads the same way: a translated, friendly title, plus a readable server
 * detail when the API gave one.
 */
export function useActionToast() {
  const t = useTranslations("toasts");

  const success = useCallback(
    (key: ToastKey) => {
      toast.success(t(key));
    },
    [t],
  );

  /**
   * `detail` overrides the derived description for sources whose messages
   * are already written for customers, such as Stripe card declines.
   */
  const error = useCallback(
    (caught: unknown, fallbackKey: ToastKey, detail?: string) => {
      if (isOffline(caught)) {
        toast.error(t("offline"));
        return;
      }
      if (caught instanceof ApiError) {
        if (caught.status === 401) return void toast.error(t("sessionExpired"));
        if (caught.status === 408) return void toast.error(t("timeout"));
        if (caught.status === 429) return void toast.error(t("rateLimited"));
      }
      toast.error(t(fallbackKey), {
        description: detail || readableServerMessage(caught),
      });
    },
    [t],
  );

  return useMemo(() => ({ success, error }), [success, error]);
}
