"use client";

import Script from "next/script";
import { LoaderCircle } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useGoogleLoginMutation } from "@/modules/account/queries/useAccountQueries";

type GoogleCredentialResponse = { credential?: string };

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: GoogleCredentialResponse) => void;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
          }) => void;
          renderButton: (
            parent: HTMLElement,
            options: Record<string, string | number>,
          ) => void;
        };
      };
    };
  }
}

interface Props {
  onAuthenticated: () => void;
  onPhoneRequired: (idToken: string) => void;
  onError: (message: string) => void;
}

const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim();

export function SocialAuthButtons({ onAuthenticated, onPhoneRequired, onError }: Props) {
  const t = useTranslations("auth");
  const googleLogin = useGoogleLoginMutation();
  const googleButton = useRef<HTMLDivElement>(null);
  const finishGoogleRef = useRef<(response: GoogleCredentialResponse) => Promise<void>>(async () => undefined);
  const [googleReady, setGoogleReady] = useState(false);

  const finishGoogle = useCallback(async (response: GoogleCredentialResponse) => {
    if (!response.credential) {
      return;
    }
    try {
      const result = await googleLogin.mutateAsync({ idToken: response.credential });
      if (result.phoneVerificationRequired) onPhoneRequired(response.credential);
      else if (result.user) onAuthenticated();
      else onError(t("socialLoginError"));
    } catch {
      onError(t("socialLoginError"));
    }
  }, [googleLogin, onAuthenticated, onPhoneRequired, onError, t]);
  finishGoogleRef.current = finishGoogle;

  useEffect(() => {
    const container = googleButton.current;
    if (!googleClientId || !googleReady || !container || !window.google) return;

    container.replaceChildren();
    window.google.accounts.id.initialize({
      client_id: googleClientId,
      callback: (response) => void finishGoogleRef.current(response),
      auto_select: false,
      cancel_on_tap_outside: true,
    });
    window.google.accounts.id.renderButton(container, {
      type: "standard",
      theme: "outline",
      size: "large",
      text: "continue_with",
      shape: "pill",
      logo_alignment: "left",
      width: Math.max(240, Math.min(400, Math.floor(container.clientWidth))),
    });
  }, [googleReady]);

  if (!googleClientId) return null;

  return (
    <div className="flex flex-col gap-3" aria-label={t("socialOptions")}>
      <div className="flex items-center gap-3" aria-hidden="true">
        <span className="h-px flex-1 bg-[#e6e8ec]" />
        <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#858890]">{t("orContinueWith")}</span>
        <span className="h-px flex-1 bg-[#e6e8ec]" />
      </div>
      <div className={`relative min-h-[52px] rounded-full px-1 py-1 transition-opacity ${googleLogin.isPending ? "pointer-events-none opacity-55" : ""}`}>
        <Script
          src="https://accounts.google.com/gsi/client"
          strategy="afterInteractive"
          onReady={() => setGoogleReady(true)}
        />
        <div ref={googleButton} className="flex min-h-11 w-full justify-center" />
        {googleLogin.isPending ? <span className="absolute inset-1 grid place-items-center rounded-full bg-white/85" role="status"><LoaderCircle className="size-5 animate-spin text-brand" aria-label={t("signingInGoogle")} /></span> : null}
      </div>
    </div>
  );
}
