"use client";

import { LoaderCircle, LogOut, ShieldAlert } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  useExitImpersonationMutation,
  useSessionQuery,
} from "@/modules/account/queries/useAccountQueries";

export function ImpersonationBanner() {
  const t = useTranslations("impersonation");
  const session = useSessionQuery();
  const exit = useExitImpersonationMutation();
  const impersonation = session.data?.impersonation;

  if (!impersonation) return null;

  async function exitImpersonation() {
    try {
      await exit.mutateAsync();
      window.location.assign(impersonation?.adminReturnUrl ?? "/");
    } catch {
      // The mutation state renders the translated recovery message.
    }
  }

  return (
    <aside
      className="relative z-[120] flex min-h-12 flex-wrap items-center justify-center gap-x-4 gap-y-2 bg-warning-soft px-4 py-2 text-sm font-semibold text-warning"
      role="status"
    >
      <span className="inline-flex items-center gap-2">
        <ShieldAlert className="size-4" aria-hidden="true" />
        {t("banner")}
      </span>
      <button
        type="button"
        disabled={exit.isPending}
        onClick={() => void exitImpersonation()}
        className="inline-flex min-h-8 items-center gap-2 rounded-full bg-warning px-4 text-xs font-bold text-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-warning disabled:cursor-wait disabled:opacity-60"
      >
        {exit.isPending ? (
          <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
        ) : (
          <LogOut className="size-4" aria-hidden="true" />
        )}
        {exit.isPending ? t("exiting") : t("exit")}
      </button>
      {exit.isError ? (
        <span className="text-danger" role="alert">
          {t("exitFailed")}
        </span>
      ) : null}
    </aside>
  );
}
