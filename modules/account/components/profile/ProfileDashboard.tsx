"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Icon, type IconName } from "@/components/shared/brand/Icon";
import { useAppCurrencyFormatter } from "@/lib/useAppCurrency";
import { ProfileSidebar } from "@/modules/account/components/profile/ProfileSidebar";
import {
  useProfileQuery,
  useProfileSummaryQuery,
  useSessionQuery,
  useWalletQuery,
} from "@/modules/account/queries/useAccountQueries";
import { userInitials } from "@/modules/account/utils/userInitials";

const SETTINGS: Array<{
  titleKey: "personalInformation" | "addressBook" | "savedCards" | "coupons" | "notificationSettings" | "accountSecurity";
  descriptionKey: "personalInformationDescription" | "addressBookDescription" | "savedCardsDescription" | "couponsDescription" | "notificationSettingsDescription" | "accountSecurityDescription";
  icon: IconName;
  iconClass: string;
  iconWrap: string;
}> = [
  {
    titleKey: "personalInformation",
    descriptionKey: "personalInformationDescription",
    icon: "avatar",
    iconClass: "text-[#24ad78]",
    iconWrap: "bg-[#eaf8f3]",
  },
  {
    titleKey: "addressBook",
    descriptionKey: "addressBookDescription",
    icon: "pin",
    iconClass: "text-brand",
    iconWrap: "bg-brand/10",
  },
  {
    titleKey: "savedCards",
    descriptionKey: "savedCardsDescription",
    icon: "wallet-card",
    iconClass: "text-[#247dcc]",
    iconWrap: "bg-[#eaf4fd]",
  },
  {
    titleKey: "coupons",
    descriptionKey: "couponsDescription",
    icon: "tag",
    iconClass: "text-[#d47a16]",
    iconWrap: "bg-[#fff4e6]",
  },
  {
    titleKey: "notificationSettings",
    descriptionKey: "notificationSettingsDescription",
    icon: "filter",
    iconClass: "text-[#179d8d]",
    iconWrap: "bg-[#eaf8f6]",
  },
  {
    titleKey: "accountSecurity",
    descriptionKey: "accountSecurityDescription",
    icon: "shield",
    iconClass: "text-brand",
    iconWrap: "bg-danger-soft",
  },
];

export function ProfileDashboard() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("profile");
  const formatAppCurrency = useAppCurrencyFormatter();
  const session = useSessionQuery();
  const authenticated = session.data?.authenticated === true;
  const profile = useProfileQuery(authenticated);
  const summary = useProfileSummaryQuery(authenticated);
  const wallet = useWalletQuery(authenticated);
  const [failedPhoto, setFailedPhoto] = useState<string | null>(null);

  useEffect(() => {
    if (!session.isPending && !authenticated) router.replace("/login");
  }, [authenticated, router, session.isPending]);

  const sessionUser = session.data?.authenticated ? session.data.user : null;
  const detailed = profile.data?.data?.user;
  const user = sessionUser
    ? {
        ...sessionUser,
        ...(detailed
          ? {
              name: detailed.name,
              email: detailed.email,
              phone: detailed.phone,
              profile: detailed.image,
            }
          : {}),
      }
    : null;
  const summaryData = summary.data?.data;
  const orderChange = Number(summaryData?.orders_change_percent ?? 0);
  const formattedOrderChange = `${orderChange > 0 ? "+" : ""}${new Intl.NumberFormat(
    locale,
    { maximumFractionDigits: 2 },
  ).format(orderChange)}%`;
  const formattedWalletBalance = formatAppCurrency(
    { number: (value, options) => new Intl.NumberFormat(locale, options).format(value) },
    Number(wallet.data?.data?.wallet_balance ?? 0),
  );
  const loading = session.isPending || (authenticated && profile.isPending);

  if (loading || !user) {
    return (
      <main className="min-h-[calc(100svh-4rem)] bg-background text-foreground md:min-h-[calc(100svh-4.75rem)] min-[700px]:grid min-[700px]:grid-cols-[240px_1fr] min-[1100px]:h-[calc(100svh-4.75rem)] min-[1100px]:overflow-hidden">
        <ProfileSidebar />
        <div className="grid min-h-[calc(100svh-8rem)] place-items-center lg:min-h-[calc(100svh-4.75rem)]">
          <div
            role="status"
            className="flex items-center gap-3 text-sm font-medium text-muted"
          >
            <span className="size-5 animate-spin rounded-full border-2 border-[#efc3ca] border-t-brand" />
            {t("loading")}
          </div>
        </div>
      </main>
    );
  }

  const photo =
    user.profile && /^(https?:)?\/\//.test(user.profile) ? user.profile : null;
  const visiblePhoto = photo && failedPhoto !== photo ? photo : null;

  return (
    <main className="min-h-[calc(100svh-4rem)] bg-background text-foreground md:min-h-[calc(100svh-4.75rem)] min-[700px]:grid min-[700px]:grid-cols-[240px_1fr] min-[1100px]:h-[calc(100svh-4.75rem)] min-[1100px]:overflow-hidden">
      <ProfileSidebar />

        <div className="mx-auto grid w-full max-w-[1400px] gap-4 p-3 sm:gap-5 sm:p-7 min-[1100px]:overflow-y-auto xl:grid-cols-[minmax(0,2fr)_minmax(250px,0.94fr)] xl:gap-6 xl:p-9">
        <div className="min-w-0 space-y-6">
          <section className="relative overflow-hidden rounded-xl bg-card p-5 shadow-card sm:p-7">
            <span className="absolute right-0 top-0 h-16 w-16 rounded-bl-[60px] bg-brand/10" />
            <div className="relative flex flex-col gap-5 sm:flex-row sm:items-start">
              <div className="relative mx-auto size-[118px] flex-none rounded-full border-[4px] border-[#e4f2ee] bg-[#f5f7f8] p-1 sm:mx-0">
                <div className="grid size-full place-items-center overflow-hidden rounded-full bg-[#eef2f4] text-3xl font-bold text-brand">
                  {visiblePhoto ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={visiblePhoto}
                      alt=""
                      className="size-full object-cover"
                      onError={() => setFailedPhoto(visiblePhoto)}
                    />
                  ) : (
                    userInitials(user.name)
                  )}
                </div>
                <span className="absolute bottom-1 right-0 grid size-7 place-items-center rounded-full border-[3px] border-white bg-brand text-ink">
                  <Icon name="shield" className="size-3.5" />
                </span>
              </div>

              <div className="min-w-0 flex-1 text-center sm:text-left">
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                  <div>
                    <h1 className="text-[22px] font-semibold leading-tight tracking-[-0.025em] sm:text-[27px]">
                      {user.name || "SIPP User"}
                    </h1>
                    <p className="mt-1 break-words text-[12px] text-body sm:text-[13px]">
                      {user.email || t("emailMissing")}
                    </p>
                    <p className="text-[12px] text-body">
                      {user.phone || t("phoneMissing")}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => router.push("/profile/personal-information/edit")}
                    className="inline-flex h-9 items-center justify-center gap-2 self-center rounded-full bg-brand px-5 text-[12px] font-semibold text-ink transition-colors hover:bg-brand/85 sm:self-start"
                  >
                    <svg viewBox="0 0 20 20" className="size-3 fill-current" aria-hidden="true">
                      <path d="m13.9 2.7 3.4 3.4-9.6 9.6-4.1.8.8-4.1 9.5-9.7Zm1.2-1.2a1.2 1.2 0 0 1 1.7 0l1.7 1.7a1.2 1.2 0 0 1 0 1.7l-.7.7-3.4-3.4.7-.7Z" />
                    </svg>
                    {t("edit")}
                  </button>
                </div>

              </div>
            </div>
          </section>

          <section className="overflow-hidden rounded-xl bg-card shadow-card">
            <header className="border-b border-line px-6 py-5">
              <h2 className="text-[17px] font-semibold">{t("accountSettings")}</h2>
            </header>
            <div className="px-5 py-3">
              {SETTINGS.map((setting) => (
                <button
                  id={setting.titleKey === "personalInformation" ? "personal-information" : undefined}
                  key={setting.titleKey}
                  type="button"
                  onClick={() => {
                    if (setting.titleKey === "personalInformation") {
                      router.push("/profile/personal-information");
                    } else if (setting.titleKey === "addressBook") {
                      router.push("/profile/address-book");
                    } else if (setting.titleKey === "savedCards") {
                      router.push("/profile/saved-cards");
                    } else if (setting.titleKey === "coupons") {
                      router.push("/profile/coupons");
                    } else if (setting.titleKey === "notificationSettings") {
                      router.push("/profile/notification-settings");
                    } else if (setting.titleKey === "accountSecurity") {
                      router.push("/profile/security");
                    }
                  }}
                  className="group flex w-full items-center gap-4 rounded-xl px-1 py-3.5 text-left transition-colors hover:bg-[#fafbfc] sm:px-2"
                >
                  <span className={`grid size-11 flex-none place-items-center rounded-xl ${setting.iconWrap}`}>
                    <Icon name={setting.icon} className={`size-5 ${setting.iconClass}`} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <b className="block text-[13px] font-bold">{t(setting.titleKey)}</b>
                    <small className="mt-0.5 block text-[11px] text-body font-semibold">
                      {t(setting.descriptionKey)}
                    </small>
                  </span>
                  <Icon
                    name="chevron"
                    className="size-4 -rotate-90 text-[#7392b7] transition-transform group-hover:translate-x-1"
                  />
                </button>
              ))}
            </div>
          </section>
        </div>

        <aside className="grid content-start gap-5 sm:grid-cols-2 xl:grid-cols-1">
          <section className="rounded-xl bg-card p-5 shadow-card">
            <div className="flex items-start justify-between">
              <span className="grid size-9 place-items-center rounded-full bg-brand/10 text-brand">
                <Image src="/icons/order-icon.png" alt="" width={18} height={18} className="size-[17px] object-contain" />
              </span>
              {summary.isPending ? (
                <span className="h-5 w-20 animate-pulse rounded-full bg-brand/10" />
              ) : (
                <span className="rounded-full bg-brand/10 px-2.5 py-1 text-[9px] font-semibold text-brand">
                  {summary.isError
                    ? "—"
                    : t("thisMonth", { change: formattedOrderChange })}
                </span>
              )}
            </div>
            <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.08em] text-body">
              {t("totalOrders")}
            </p>
            {summary.isPending ? (
              <span className="mt-2 block h-8 w-16 animate-pulse rounded-md bg-[var(--soft-surface)]" />
            ) : (
              <strong className="mt-1 block text-[31px] font-semibold leading-none">
                {summary.isError
                  ? "—"
                  : new Intl.NumberFormat(locale).format(
                      Number(summaryData?.total_orders ?? 0),
                    )}
              </strong>
            )}
          </section>

          <section className="rounded-xl bg-brand p-5 text-ink shadow-[0_8px_24px_rgba(102,192,242,0.18)]">
            <div className="flex items-start justify-between">
              <span className="grid size-9 place-items-center rounded-full bg-white/15">
                <Image src="/icons/wallet-icon.png" alt="" width={18} height={18} className="size-[17px] brightness-0 invert" />
              </span>
              <button type="button" className="rounded-full border border-brand bg-white px-3 py-1 text-[9px] font-semibold text-brand">
                {t("topUp")}
              </button>
            </div>
            <p className="mt-5 text-[11px] font-medium uppercase tracking-[0.08em] text-white/80">
              {t("walletBalance")}
            </p>
            {wallet.isPending ? (
              <span className="mt-2 block h-8 w-28 animate-pulse rounded-md bg-white/15" />
            ) : (
              <strong className="mt-1 block text-[29px] font-semibold leading-none">
                {wallet.isError ? "—" : formattedWalletBalance}
              </strong>
            )}
          </section>

          <section className="relative overflow-hidden rounded-xl bg-brand-soft p-5 text-ink shadow-[0_5px_22px_rgba(37,49,63,0.04)] sm:col-span-2 xl:col-span-1">
            <Image
              src="/icons/customer-support-icon.png"
              alt=""
              width={64}
              height={64}
              className="absolute right-4 top-4 size-14 object-contain opacity-10"
            />
            <h2 className="relative text-[14px] font-semibold">{t("needHelp")}</h2>
            <p className="relative mt-2 max-w-[22ch] text-[10px] leading-snug">
              {t("helpDescription")}
            </p>
            <Link
              href="/help"
              className="relative mt-5 inline-flex h-10 w-full items-center justify-center rounded-full bg-brand text-[11px] font-semibold text-ink transition-colors hover:bg-brand/85"
            >
              {t("contactSupport")}
            </Link>
          </section>
        </aside>
      </div>
    </main>
  );
}
