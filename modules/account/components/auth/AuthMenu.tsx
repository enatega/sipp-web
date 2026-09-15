"use client";

import Link from "next/link";
import { LoaderCircle, LogOut } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { AccountMenu } from "@/modules/account/components/auth/AccountMenu";
import {
  useLogoutMutation,
  useProfileQuery,
  useSessionQuery,
} from "@/modules/account/queries/useAccountQueries";
import { useCartQuery } from "@/modules/deliveries/hooks/useCart";
import { setIntentionalLogout } from "@/services/api/client";
import { loginHref } from "@/modules/account/utils/authRedirect";

export function AuthMenu({ cartCount = 0 }: { cartCount?: number }) {
  const t = useTranslations("auth");
  const common = useTranslations("common");
  const navigation = useTranslations("navigation");
  const router = useRouter();
  const pathname = usePathname();
  const session = useSessionQuery();
  const logout = useLogoutMutation();
  const [confirmingLogout, setConfirmingLogout] = useState(false);
  const [logoutError, setLogoutError] = useState("");
  const user = session.data?.authenticated ? session.data.user : null;
  const profile = useProfileQuery(Boolean(user));
  const profileUser = profile.data?.data?.user;
  const headerUser =
    user && profileUser
      ? {
          ...user,
          name: profileUser.name,
          email: profileUser.email,
          phone: profileUser.phone,
          profile: profileUser.image,
        }
      : user;
  const cart = useCartQuery(Boolean(user));
  const visibleCartCount = user ? (cart.data?.totalItems ?? cartCount) : 0;

  if (session.isPending) {
    return (
      <span
        className="block h-11 w-[248px] flex-none rounded-full bg-[#f4f2f3] max-sm:w-[148px]"
        aria-label={t("checkingAccount")}
      />
    );
  }

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Link
          className="inline-flex min-h-[42px] items-center justify-center rounded-full border border-brand px-5 text-sm font-bold text-brand transition-colors hover:bg-brand hover:text-white max-sm:min-h-10 max-sm:px-3 max-sm:text-xs"
          href="/become-a-vendor"
        >
          <span className="max-sm:hidden">{navigation("becomeVendor")}</span>
          <span className="sm:hidden">{navigation("becomeVendorShort")}</span>
        </Link>
        <Link
          className="inline-flex min-h-[42px] min-w-[108px] items-center justify-center rounded-full bg-brand px-6 text-sm font-bold text-ink transition-[translate,background-color,box-shadow] duration-[180ms] hover:-translate-y-px hover:bg-brand/85 hover:shadow-[0_9px_20px_rgba(102,192,242,0.18)] max-sm:min-h-10 max-sm:min-w-0 max-sm:px-4 max-sm:text-xs"
          href={loginHref(pathname)}
          onClick={(event) => {
            event.preventDefault();
            router.push(
              loginHref(`${window.location.pathname}${window.location.search}`),
            );
          }}
        >
          {t("login")}
        </Link>
      </div>
    );
  }

  async function confirmLogout() {
    setLogoutError("");
    setIntentionalLogout(true);
    try {
      await logout.mutateAsync();
      router.replace("/login");
      router.refresh();
    } catch (caught) {
      setIntentionalLogout(false);
      setLogoutError(caught instanceof Error ? caught.message : common("logoutError"));
    }
  }

  return (
    <>
      <AccountMenu
        user={headerUser ?? user}
        cartCount={visibleCartCount}
        onSignOut={() => {
          setLogoutError("");
          setConfirmingLogout(true);
        }}
      />
      {confirmingLogout ? (
        <div className="fixed inset-0 z-[110] grid place-items-center bg-black/55 p-4 backdrop-blur-[2px]" role="dialog" aria-modal="true" aria-labelledby="logout-dialog-title">
          <div className="w-full max-w-sm rounded-3xl border border-line bg-card p-6 text-center shadow-[0_28px_90px_rgba(20,10,14,0.3)]">
            <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-danger-soft text-brand">
              {logout.isPending ? <LoaderCircle className="size-5 animate-spin" aria-hidden="true" /> : <LogOut className="size-5" aria-hidden="true" />}
            </span>
            <h2 id="logout-dialog-title" className="mt-4 text-xl font-bold text-ink">{logout.isPending ? common("loggingOut") : common("logoutConfirmTitle")}</h2>
            <p className="mt-2 text-sm leading-6 text-body">{logout.isPending ? common("loggingOutDescription") : common("logoutConfirmDescription")}</p>
            {logoutError ? <p className="mt-4 rounded-xl bg-danger-soft px-4 py-3 text-sm font-medium text-danger" role="alert">{logoutError}</p> : null}
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button type="button" disabled={logout.isPending} onClick={() => setConfirmingLogout(false)} className="min-h-11 rounded-full border border-line px-4 text-sm font-bold text-ink transition-colors hover:bg-[var(--soft-surface)] disabled:cursor-wait disabled:opacity-50">{common("cancel")}</button>
              <button type="button" disabled={logout.isPending} onClick={() => void confirmLogout()} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-brand px-4 text-sm font-bold text-ink transition-colors hover:bg-brand/85 disabled:cursor-wait disabled:opacity-65">
                {logout.isPending ? <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> : null}
                {logout.isPending ? common("loggingOut") : common("logout")}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
