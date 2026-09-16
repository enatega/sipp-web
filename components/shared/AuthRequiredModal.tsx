"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { loginHref } from "@/modules/account/utils/authRedirect";
import { onAuthRequiredDialog } from "@/components/shared/authRequiredEvent";

export function AuthRequiredModal() {
  const t = useTranslations("common");
  const router = useRouter();
  const [returnTo, setReturnTo] = useState<string | undefined>(undefined);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    return onAuthRequiredDialog((detail) => {
      setReturnTo(detail.returnTo);
      setOpen(true);
    });
  }, []);

  if (!open) return null;

  return (
    <div
      aria-labelledby="auth-required-title"
      aria-modal="true"
      className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
    >
      <div className="w-full max-w-sm rounded-2xl bg-card p-6 text-center shadow-2xl">
        <h2 className="text-lg font-semibold" id="auth-required-title">
          {t("authRequiredTitle")}
        </h2>
        <p className="mt-2 text-sm text-muted">{t("authRequiredDescription")}</p>
        <button
          className="mt-6 w-full rounded-full bg-brand px-4 py-3 text-sm font-semibold text-ink"
          onClick={() => {
            setOpen(false);
            router.push(loginHref(returnTo ?? window.location.pathname));
          }}
          type="button"
        >
          {t("authRequiredLogin")}
        </button>
        <button
          className="mt-2 w-full py-2 text-sm text-muted"
          onClick={() => setOpen(false)}
          type="button"
        >
          {t("authRequiredClose")}
        </button>
      </div>
    </div>
  );
}
