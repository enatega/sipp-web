"use client";

import { LoaderCircle, ShieldAlert } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { useExchangeImpersonationMutation } from "@/modules/account/queries/useAccountQueries";

export function ImpersonateExperience() {
  const t = useTranslations("impersonation");
  const exchange = useExchangeImpersonationMutation();
  const started = useRef(false);
  const [hasMissingToken, setHasMissingToken] = useState(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const url = new URL(window.location.href);
    const token = url.searchParams.get("token");
    window.history.replaceState({}, "", "/auth/impersonate");

    if (!token) {
      queueMicrotask(() => setHasMissingToken(true));
      return;
    }

    void exchange
      .mutateAsync({ token })
      .then(() => {
        window.location.replace("/");
      })
      .catch(() => {
        // The mutation state renders the translated recovery message.
      });
  }, [exchange]);

  const hasError = hasMissingToken || exchange.isError;

  return (
    <main className="grid min-h-screen place-items-center bg-surface px-5">
      <div className="w-full max-w-md rounded-3xl border border-line bg-card p-8 text-center shadow-pop">
        {hasError ? (
          <>
            <ShieldAlert
              className="mx-auto size-10 text-danger"
              aria-hidden="true"
            />
            <h1 className="mt-4 text-xl font-bold text-ink">
              {t("unableTitle")}
            </h1>
            <p className="mt-2 text-sm leading-6 text-body" role="alert">
              {hasMissingToken ? t("invalidLink") : t("exchangeFailed")}
            </p>
          </>
        ) : (
          <>
            <LoaderCircle
              className="mx-auto size-10 animate-spin text-brand"
              aria-hidden="true"
            />
            <h1 className="mt-4 text-xl font-bold text-ink">
              {t("signingInTitle")}
            </h1>
            <p className="mt-2 text-sm leading-6 text-body">
              {t("signingInDescription")}
            </p>
          </>
        )}
      </div>
    </main>
  );
}
