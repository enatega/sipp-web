import { apiRoutes } from "@/config/api";
import { requestJson } from "@/services/api/client";
import type {
  SavedCardActionPayload,
  SavedCardsPayload,
  SavedCardSetupIntent,
} from "@/modules/account/types";

export const paymentApi = {
  savedCards(signal?: AbortSignal) {
    return requestJson<SavedCardsPayload>(apiRoutes.savedCards, {
      cache: "no-store",
      signal,
    });
  },
  createSetupIntent() {
    return requestJson<SavedCardSetupIntent>(
      `${apiRoutes.savedCards}/setup-intent`,
      { method: "POST", body: JSON.stringify({}) },
    );
  },
  remove(paymentMethodId: string) {
    return requestJson<SavedCardActionPayload>(
      `${apiRoutes.savedCards}/${encodeURIComponent(paymentMethodId)}`,
      { method: "DELETE" },
    );
  },
  setDefault(paymentMethodId: string) {
    return requestJson<SavedCardActionPayload>(
      `${apiRoutes.savedCards}/${encodeURIComponent(paymentMethodId)}/default`,
      { method: "PATCH", body: JSON.stringify({}) },
    );
  },
};
