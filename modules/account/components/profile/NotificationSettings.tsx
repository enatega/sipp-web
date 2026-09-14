"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useFormik } from "formik";
import { LoaderCircle } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { ProfileSidebar } from "@/modules/account/components/profile/ProfileSidebar";
import { ProfileBackLink } from "@/modules/account/components/profile/ProfileBackLink";
import {
  useNotificationSettingsQuery,
  useSessionQuery,
  useUpdateNotificationSettingsMutation,
} from "@/modules/account/queries/useAccountQueries";
import type { NotificationSettingsInput } from "@/modules/account/types";

const DEFAULT_VALUES: NotificationSettingsInput = {
  food_delivery_email: true,
  food_delivery_sms: true,
  food_delivery_whatsapp: true,
  marketing_email: true,
  marketing_sms: true,
  marketing_whatsapp: true,
};

type ToggleFieldProps = {
  label: string;
  description: string;
  name: keyof NotificationSettingsInput;
  value: boolean;
  onChange: () => void;
};

function ToggleField({
  label,
  description,
  name,
  value,
  onChange,
}: ToggleFieldProps) {
  return (
    <label className="flex min-h-[62px] cursor-pointer items-center justify-between gap-4 border-b border-line py-3 last:border-b-0">
      <span className="min-w-0">
        <strong className="block text-[11px] font-semibold">{label}</strong>
        <small className="mt-0.5 block text-[9px] leading-snug text-body">
          {description}
        </small>
      </span>
      <input
        type="checkbox"
        name={name}
        checked={value}
        onChange={onChange}
        className="peer sr-only"
      />
      <span
        aria-hidden="true"
        className={`relative h-5 w-9 flex-none rounded-full transition-colors ${
          value ? "bg-[#4dbb54]" : "bg-[#626267]"
        }`}
      >
        <span
          className={`absolute top-0.5 size-4 rounded-full bg-white shadow-sm transition-transform ${
            value ? "translate-x-[17px]" : "translate-x-0.5"
          }`}
        />
      </span>
    </label>
  );
}

function SettingsGroup({
  title,
  subtitle,
  icon,
  children,
}: {
  title: string;
  subtitle: string;
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl bg-card px-5 py-5 shadow-card sm:px-6">
      <header className="mb-3 flex items-center gap-3">
        <span className="grid size-9 flex-none place-items-center rounded-lg bg-[#fde7eb] p-2 dark:bg-[#401d25]">
          <Image src={icon} alt="" width={20} height={20} className="size-full object-contain" />
        </span>
        <div>
          <h2 className="text-[13px] font-semibold">{title}</h2>
          <p className="text-[9px] text-body">{subtitle}</p>
        </div>
      </header>
      {children}
    </section>
  );
}

export function NotificationSettings() {
  const t = useTranslations("notificationSettings");
  const locale = useLocale();
  const router = useRouter();
  const session = useSessionQuery();
  const authenticated = session.data?.authenticated === true;
  const settings = useNotificationSettingsQuery(authenticated);
  const update = useUpdateNotificationSettingsMutation();

  const formik = useFormik<NotificationSettingsInput>({
    initialValues: DEFAULT_VALUES,
    onSubmit: async (values, helpers) => {
      helpers.setStatus(undefined);
      try {
        await update.mutateAsync(values);
        helpers.setStatus("saved");
      } catch {
        helpers.setStatus(t("saveError"));
      }
    },
  });

  const serverValues = settings.data?.data;
  useEffect(() => {
    if (!serverValues) return;
    formik.setValues({
      food_delivery_email: serverValues.food_delivery_email,
      food_delivery_sms: serverValues.food_delivery_sms,
      food_delivery_whatsapp: serverValues.food_delivery_whatsapp,
      marketing_email: serverValues.marketing_email,
      marketing_sms: serverValues.marketing_sms,
      marketing_whatsapp: serverValues.marketing_whatsapp,
    });
  }, [serverValues]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!session.isPending && !authenticated) router.replace("/login");
  }, [authenticated, router, session.isPending]);

  const updatedAt = (() => {
    if (!serverValues?.updated_at) return null;
    const date = new Date(serverValues.updated_at);
    if (Number.isNaN(date.getTime())) return null;
    return new Intl.DateTimeFormat(locale, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);
  })();

  const loading = session.isPending || (authenticated && settings.isPending);

  return (
    <main className="min-h-[calc(100svh-4rem)] bg-background text-foreground md:min-h-[calc(100svh-4.75rem)] min-[700px]:grid min-[700px]:grid-cols-[240px_1fr] min-[1100px]:h-[calc(100svh-4.75rem)] min-[1100px]:overflow-hidden">
      <ProfileSidebar />
      <div className="min-w-0 min-[1100px]:overflow-y-auto">
        <div className="mx-auto w-full max-w-[1100px] px-5 py-7 sm:px-8 sm:py-8">
          <header className="mb-7 max-w-[62ch]">
            <ProfileBackLink />
            <h1 className="text-[25px] font-semibold tracking-[-0.025em] sm:text-[29px]">{t("title")}</h1>
            <p className="mt-1 text-[12px] leading-relaxed text-body">{t("subtitle")}</p>
          </header>

          {loading ? (
            <div className="grid min-h-72 place-items-center" role="status">
              <div className="flex items-center gap-3 text-sm font-medium text-muted">
                <LoaderCircle className="size-5 animate-spin text-brand" />
                {t("loading")}
              </div>
            </div>
          ) : settings.isError ? (
            <div role="alert" className="rounded-xl bg-card p-6 text-[13px] text-brand shadow-card">
              {t("loadError")}
              <button type="button" onClick={() => void settings.refetch()} className="mt-4 block rounded-full bg-brand px-5 py-2 text-[11px] font-semibold text-white">
                {t("retry")}
              </button>
            </div>
          ) : authenticated ? (
            <form onSubmit={formik.handleSubmit}>
              <div className="grid gap-5 xl:grid-cols-[minmax(0,1.75fr)_minmax(230px,0.8fr)]">
                <div className="space-y-5">
                  <SettingsGroup title={t("orderTitle")} subtitle={t("orderSubtitle")} icon="/icons/order-updates.png">
                    <ToggleField label={t("email")} description={t("emailDescription")} name="food_delivery_email" value={formik.values.food_delivery_email} onChange={() => formik.setFieldValue("food_delivery_email", !formik.values.food_delivery_email)} />
                    <ToggleField label={t("sms")} description={t("smsDescription")} name="food_delivery_sms" value={formik.values.food_delivery_sms} onChange={() => formik.setFieldValue("food_delivery_sms", !formik.values.food_delivery_sms)} />
                    <ToggleField label={t("whatsapp")} description={t("whatsappDescription")} name="food_delivery_whatsapp" value={formik.values.food_delivery_whatsapp} onChange={() => formik.setFieldValue("food_delivery_whatsapp", !formik.values.food_delivery_whatsapp)} />
                  </SettingsGroup>
                  <SettingsGroup title={t("marketingTitle")} subtitle={t("marketingSubtitle")} icon="/icons/system-account.png">
                    <ToggleField label={t("email")} description={t("marketingEmailDescription")} name="marketing_email" value={formik.values.marketing_email} onChange={() => formik.setFieldValue("marketing_email", !formik.values.marketing_email)} />
                    <ToggleField label={t("sms")} description={t("marketingSmsDescription")} name="marketing_sms" value={formik.values.marketing_sms} onChange={() => formik.setFieldValue("marketing_sms", !formik.values.marketing_sms)} />
                    <ToggleField label={t("whatsapp")} description={t("marketingWhatsappDescription")} name="marketing_whatsapp" value={formik.values.marketing_whatsapp} onChange={() => formik.setFieldValue("marketing_whatsapp", !formik.values.marketing_whatsapp)} />
                  </SettingsGroup>
                </div>

                <SettingsGroup title={t("offersTitle")} subtitle={t("offersSubtitle")} icon="/icons/offers.png">
                  <div className="rounded-lg border border-line bg-[var(--soft-surface)] p-4 text-[10px] leading-relaxed text-body">
                    {t("offersDescription")}
                  </div>
                  <p className="mt-4 rounded-lg bg-[#fde1e6] p-3 text-[9px] leading-relaxed text-brand dark:bg-[#401d25]">
                    {t("offersNote")}
                  </p>
                </SettingsGroup>
              </div>

              <footer className="mt-5 flex flex-col gap-3 border-t border-line pt-4 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-[9px] text-body">{updatedAt ? t("updatedAt", { date: updatedAt }) : t("notUpdated")}</span>
                <div className="flex items-center justify-end gap-4">
                  {formik.status === "saved" ? <span className="text-[10px] font-semibold text-[#15935f]">{t("saved")}</span> : null}
                  {formik.status && formik.status !== "saved" ? <span role="alert" className="text-[10px] text-brand">{formik.status}</span> : null}
                  <button type="button" onClick={() => formik.resetForm()} className="text-[11px] font-semibold text-foreground hover:text-brand">{t("discard")}</button>
                  <button type="submit" disabled={update.isPending} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-brand px-6 text-[11px] font-semibold text-white hover:bg-brand-deep disabled:cursor-wait disabled:opacity-60">
                    {update.isPending ? <LoaderCircle className="size-3.5 animate-spin" aria-hidden="true" /> : null}
                    {update.isPending ? t("saving") : t("save")}
                  </button>
                </div>
              </footer>
            </form>
          ) : null}
        </div>
      </div>
    </main>
  );
}
