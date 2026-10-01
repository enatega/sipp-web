import { apiRoutes } from "@/config/api";
import { ApiError, postJson, requestJson } from "@/services/api/client";
import type { AuthUser, SessionResponse } from "@/modules/account/types";

export { ApiError as AuthApiError };

type CountryRegion = { country: string | null };

async function lookupBrowserCountry(url: string, field: "country" | "country_code") {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 2_500);
  try {
    const response = await fetch(url, {
      cache: "no-store",
      signal: controller.signal,
    });
    if (!response.ok) return null;
    const payload = (await response.json()) as Record<string, unknown>;
    const country = payload[field];
    if (payload.error || typeof country !== "string") return null;
    const code = country.toUpperCase();
    return /^[A-Z]{2}$/.test(code) ? code : null;
  } catch {
    return null;
  } finally {
    window.clearTimeout(timeout);
  }
}

export const authApi = {
  async countryRegion(): Promise<CountryRegion> {
    // These services see the browser's public IP, including during local development.
    const country = await lookupBrowserCountry("https://ipinfo.io/json", "country")
      ?? await lookupBrowserCountry("https://ipapi.co/json/", "country_code");
    if (country) return { country };

    // Deployment proxies may provide a trusted country header when browser lookups are blocked.
    return requestJson<CountryRegion>("/api/auth/region").catch(() => ({ country: null }));
  },
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
