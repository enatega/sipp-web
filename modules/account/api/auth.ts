import { apiRoutes } from "@/config/api";
import { ApiError, postJson, requestJson } from "@/services/api/client";
import type { AuthUser, SessionResponse } from "@/modules/account/types";

export { ApiError as AuthApiError };

export const authApi = {
  emailExists(payload: { email: string }) {
    return postJson<{ exists: boolean; uncertain?: boolean }>(
      apiRoutes.auth.exists,
      payload,
    );
  },
  login(payload: { email: string; password: string }) {
    return postJson<{ user: AuthUser }>(apiRoutes.auth.login, payload);
  },
  googleLogin(payload: { idToken: string }) {
    return postJson<{ user: AuthUser }>(apiRoutes.auth.google, payload);
  },
  exchangeImpersonation(payload: { token: string }) {
    return postJson<{ user: AuthUser }>(
      apiRoutes.auth.impersonationExchange,
      payload,
    );
  },
  exitImpersonation() {
    return postJson<{ success: boolean }>(apiRoutes.auth.impersonationExit);
  },
  sendPhoneOtp(payload: { phone: string }) {
    return postJson<{ message: string }>(apiRoutes.auth.phoneSend, payload);
  },
  verifyPhoneOtp(payload: { phone: string; otp: string }) {
    return postJson<{ user: AuthUser }>(apiRoutes.auth.phoneVerify, payload);
  },
  sendSignupOtp(payload: { email: string; phone: string }) {
    return postJson<{ message: string }>(apiRoutes.auth.signupSend, payload);
  },
  verifySignupOtp(payload: {
    name: string;
    email: string;
    phone: string;
    password: string;
    otp: string;
  }) {
    return postJson<{ user: AuthUser }>(apiRoutes.auth.signupVerify, payload);
  },
  sendForgotPasswordOtp(payload: { email: string }) {
    return postJson<{ message: string }>(apiRoutes.auth.forgotPasswordSend, payload);
  },
  verifyForgotPasswordOtp(payload: { email: string; otp: string }) {
    return postJson<{ message: string }>(apiRoutes.auth.forgotPasswordVerify, payload);
  },
  resetForgottenPassword(payload: { password: string }) {
    return postJson<{ message: string }>(apiRoutes.auth.forgotPasswordReset, payload);
  },
  session() {
    return requestJson<SessionResponse>(apiRoutes.auth.session, {
      cache: "no-store",
    });
  },
  logout() {
    return postJson<{ success: boolean }>(apiRoutes.auth.logout);
  },
};
