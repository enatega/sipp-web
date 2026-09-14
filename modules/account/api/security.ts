import { apiRoutes } from "@/config/api";
import { postJson, requestJson } from "@/services/api/client";

export type DeletionReason =
  | "no_longer_needed"
  | "cannot_find_stores"
  | "privacy_concerns"
  | "poor_experience"
  | "other";

export const securityApi = {
  sendPasswordOtp() {
    return postJson<{ message: string }>(apiRoutes.accountSecurity.passwordSend);
  },
  verifyPasswordOtp(otp: string) {
    return postJson<{ message: string }>(apiRoutes.accountSecurity.passwordVerify, { otp });
  },
  updatePassword(payload: { otp: string; newPassword: string }) {
    return postJson<{ message: string }>(apiRoutes.accountSecurity.passwordUpdate, payload);
  },
  deleteAccount(payload: { reason: DeletionReason; confirmationEmail: string }) {
    return requestJson<{ message: string }>(apiRoutes.accountSecurity.deleteAccount, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },
};
