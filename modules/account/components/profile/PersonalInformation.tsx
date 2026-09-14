"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { useFormik } from "formik";
import { useLocale, useTranslations } from "next-intl";
import { Icon } from "@/components/shared/brand/Icon";
import { ProfileSidebar } from "@/modules/account/components/profile/ProfileSidebar";
import { ProfilePhotoManager } from "@/modules/account/components/profile/ProfilePhotoManager";
import { ProfileBackLink } from "@/modules/account/components/profile/ProfileBackLink";
import type {
  ProfileGender,
  ProfileUpdateInput,
  ProfileUser,
  SavedCard,
  SavedAddress,
} from "@/modules/account/types";
import {
  useProfileQuery,
  useSavedCardsQuery,
  useSessionQuery,
  useUpdateProfileMutation,
} from "@/modules/account/queries/useAccountQueries";
import { createProfileSchema } from "@/modules/account/schemas/profileSchema";

type PersonalInformationProps = {
  editing?: boolean;
};

function dateInputValue(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
}

function PrivacyNotice() {
  const t = useTranslations("profileInformation");

  return (
    <section className="rounded-xl border border-line bg-[var(--soft-surface)] px-4 py-5 sm:px-6 sm:py-6">
      <div className="flex items-start gap-3">
        <Icon name="shield" className="mt-0.5 size-4 flex-none text-brand" />
        <div>
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.08em]">
            {t("privacyTitle")}
          </h2>
          <p className="mt-2 max-w-[30ch] text-[10px] leading-[1.55] text-body sm:mt-3 sm:text-[11px]">
            {t("privacyDescription")}
          </p>
        </div>
      </div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-[10px] font-semibold uppercase tracking-[0.08em] text-body">
        {label}
      </dt>
      <dd className="mt-2 flex min-h-11 items-center rounded-full bg-[var(--soft-surface)] px-4 text-[13px] font-medium text-foreground">
        {children}
      </dd>
    </div>
  );
}

function GenderChoices({ value }: { value?: ProfileGender | null }) {
  const t = useTranslations("profileInformation");

  return (
    <div className="flex flex-wrap gap-2.5">
      {(["MALE", "FEMALE", "OTHER"] as const).map((gender) => (
        <span
          key={gender}
          className={`inline-flex min-h-10 items-center gap-2 rounded-full px-4 text-[12px] font-semibold ${
            value === gender
              ? "border border-brand bg-card text-brand"
              : "bg-[var(--soft-surface)] text-body"
          }`}
        >
          <Icon
            name={gender === "OTHER" ? "filter" : "avatar"}
            className="size-3.5"
          />
          {t(`gender${gender}`)}
        </span>
      ))}
    </div>
  );
}

function ProfileDetails({ user }: { user: ProfileUser }) {
  const t = useTranslations("profileInformation");
  const locale = useLocale();
  const formattedDate = useMemo(() => {
    if (!user.date_of_birth) return t("notProvided");
    const date = new Date(user.date_of_birth);
    return Number.isNaN(date.getTime())
      ? t("notProvided")
      : new Intl.DateTimeFormat(locale, {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        }).format(date);
  }, [locale, t, user.date_of_birth]);

  return (
    <section className="rounded-xl bg-card p-6 shadow-card sm:p-8">
      <div className="mb-6 flex justify-end">
        <Link
          href="/profile/personal-information/edit"
          className="inline-flex min-h-10 items-center gap-2 rounded-full bg-brand px-5 text-[12px] font-semibold text-white transition-colors hover:bg-brand-deep"
        >
          <Icon name="avatar" className="size-3.5" />
          {t("editProfile")}
        </Link>
      </div>
      <dl className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
        <Field label={t("fullName")}>{user.name || t("notProvided")}</Field>
        <Field label={t("emailAddress")}>
          <span className="min-w-0 flex-1 truncate">
            {user.email || t("notProvided")}
          </span>
          {user.email ? (
            <span className="ml-2 inline-flex items-center gap-1 text-[9px] font-semibold text-[#15935f] dark:text-[#63d8a5]">
              <Icon name="shield" className="size-3" />
              {t("verified")}
            </span>
          ) : null}
        </Field>
        <Field label={t("phoneNumber")}>{user.phone || t("notProvided")}</Field>
        <Field label={t("dateOfBirth")}>{formattedDate}</Field>
        <div className="sm:col-span-2">
          <dt className="text-[10px] font-semibold uppercase tracking-[0.08em] text-body">
            {t("gender")}
          </dt>
          <dd className="mt-2">
            <GenderChoices value={user.gender} />
          </dd>
        </div>
      </dl>
    </section>
  );
}

function EditProfileForm({ user }: { user: ProfileUser }) {
  const t = useTranslations("profileInformation");
  const router = useRouter();
  const updateProfile = useUpdateProfileMutation();
  const formik = useFormik({
    initialValues: {
      name: user.name ?? "",
      dateOfBirth: dateInputValue(user.date_of_birth),
      gender: (user.gender ?? "OTHER") as ProfileGender,
    },
    validationSchema: createProfileSchema(t("nameRequired")),
    onSubmit: async (values, helpers) => {
      helpers.setStatus(undefined);
      const payload: ProfileUpdateInput = {
        name: values.name.trim(),
        gender: values.gender,
        ...(values.dateOfBirth ? { dateOfBirth: values.dateOfBirth } : {}),
      };
      try {
        await updateProfile.mutateAsync(payload);
        router.push("/profile/personal-information");
        router.refresh();
      } catch (reason) {
        helpers.setStatus(reason instanceof Error ? reason.message : t("saveError"));
      }
    },
  });

  const inputClass =
    "mt-2 min-h-11 w-full rounded-full border border-transparent bg-[var(--soft-surface)] px-4 text-[13px] font-medium text-foreground outline-none transition-colors focus:border-brand disabled:cursor-not-allowed disabled:opacity-70";
  const labelClass =
    "text-[10px] font-semibold uppercase tracking-[0.08em] text-body";

  return (
    <form onSubmit={formik.handleSubmit} className="rounded-xl bg-card p-6 shadow-card sm:p-8">
      <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
        <label className={labelClass}>
          {t("fullName")}
          <input
            name="name"
            value={formik.values.name}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className={inputClass}
            autoComplete="name"
            maxLength={120}
            required
          />
        </label>
        <label className={labelClass}>
          {t("emailAddress")}
          <span className="relative block">
            <input
              value={user.email ?? ""}
              className={`${inputClass} pr-20`}
              autoComplete="email"
              disabled
            />
            {user.email ? (
              <span className="absolute right-4 top-1/2 mt-1 inline-flex -translate-y-1/2 items-center gap-1 text-[9px] font-semibold text-[#15935f] dark:text-[#63d8a5]">
                <Icon name="shield" className="size-3" />
                {t("verified")}
              </span>
            ) : null}
          </span>
        </label>
        <label className={labelClass}>
          {t("phoneNumber")}
          <input
            value={user.phone ?? ""}
            className={inputClass}
            autoComplete="tel"
            disabled
          />
        </label>
        <label className={labelClass}>
          {t("dateOfBirth")}
          <input
            type="date"
            name="dateOfBirth"
            value={formik.values.dateOfBirth}
            max={new Date().toISOString().slice(0, 10)}
            onChange={formik.handleChange}
            className={inputClass}
          />
        </label>
        <fieldset className="sm:col-span-2">
          <legend className={labelClass}>{t("gender")}</legend>
          <div className="mt-2 flex flex-wrap gap-2.5">
            {(["MALE", "FEMALE", "OTHER"] as const).map((option) => (
              <label
                key={option}
                className={`inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-full px-4 text-[12px] font-semibold transition-colors ${
                  formik.values.gender === option
                    ? "border border-brand bg-card text-brand"
                    : "bg-[var(--soft-surface)] text-body hover:text-foreground"
                }`}
              >
                <input
                  type="radio"
                  name="gender"
                  value={option}
                  checked={formik.values.gender === option}
                  onChange={formik.handleChange}
                  className="sr-only"
                />
                <Icon
                  name={option === "OTHER" ? "filter" : "avatar"}
                  className="size-3.5"
                />
                {t(`gender${option}`)}
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      {(formik.touched.name && formik.errors.name) || formik.status ? (
        <p role="alert" className="mt-5 rounded-xl bg-[#fde7eb] px-4 py-3 text-[12px] font-medium text-brand dark:bg-[#401d25]">
          {formik.status || formik.errors.name}
        </p>
      ) : null}

      <div className="mt-7 flex flex-col-reverse items-stretch justify-end gap-3 border-t border-line pt-6 sm:flex-row sm:items-center">
        <Link
          href="/profile/personal-information"
          className="inline-flex min-h-11 items-center justify-center rounded-full px-5 text-[12px] font-semibold text-body hover:text-foreground"
        >
          {t("discardChanges")}
        </Link>
        <button
          type="submit"
          disabled={formik.isSubmitting}
          className="inline-flex min-h-11 min-w-40 items-center justify-center rounded-full bg-brand px-6 text-[12px] font-semibold text-white transition-colors hover:bg-brand-deep disabled:cursor-wait disabled:opacity-60"
        >
          {formik.isSubmitting ? t("savingChanges") : t("saveChanges")}
        </button>
      </div>
    </form>
  );
}

function SummaryCards({
  addresses,
  savedCard,
}: {
  addresses: SavedAddress[];
  savedCard?: SavedCard;
}) {
  const t = useTranslations("profileInformation");
  const primaryAddress = addresses.find((address) => address.is_selected) ?? addresses[0];

  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <section className="flex min-h-32 gap-4 rounded-xl bg-card p-5 shadow-card">
        <span className="grid size-10 flex-none place-items-center rounded-xl bg-[#fde7eb] text-brand dark:bg-[#401d25]">
          <Icon name="pin" className="size-4" />
        </span>
        <div className="min-w-0">
          <h2 className="text-[12px] font-semibold">{t("primaryAddress")}</h2>
          <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-body">
            {primaryAddress?.address ?? t("noPrimaryAddress")}
          </p>
          <Link href="/profile/address-book" className="mt-2 inline-block text-[9px] font-semibold uppercase text-brand">
            {t("manageAddresses")}
          </Link>
        </div>
      </section>

      <section className="flex min-h-32 gap-4 rounded-xl bg-card p-5 shadow-card">
        <span className="grid size-10 flex-none place-items-center rounded-xl bg-[#eaf4fd] text-[#247dcc] dark:bg-[#17334b] dark:text-[#70b7f5]">
          <Icon name="wallet-card" className="size-4" />
        </span>
        <div className="min-w-0">
          <h2 className="text-[12px] font-semibold">{t("savedCard")}</h2>
          <p className="mt-1 text-[11px] leading-relaxed text-body">
            {savedCard
              ? `${savedCard.brand.toUpperCase()} •••• ${savedCard.last4}`
              : t("noSavedCard")}
          </p>
          <Link href="/profile/saved-cards" className="mt-2 inline-block text-[9px] font-semibold uppercase text-brand">
            {t("managePayments")}
          </Link>
        </div>
      </section>
    </div>
  );
}

export function PersonalInformation({ editing = false }: PersonalInformationProps) {
  const t = useTranslations("profileInformation");
  const router = useRouter();
  const session = useSessionQuery();
  const authenticated = session.data?.authenticated === true;
  const profile = useProfileQuery(authenticated);
  const savedCards = useSavedCardsQuery(authenticated);

  useEffect(() => {
    if (!session.isPending && !authenticated) router.replace("/login");
  }, [authenticated, router, session.isPending]);

  const user = profile.data?.data?.user ?? null;
  const addresses = profile.data?.data?.addresses ?? [];
  const loading = session.isPending || (authenticated && profile.isPending);
  const loadError = profile.error instanceof Error ? profile.error.message : "";

  return (
    <main className="min-h-[calc(100svh-4rem)] bg-background text-foreground md:min-h-[calc(100svh-4.75rem)] min-[700px]:grid min-[700px]:grid-cols-[240px_1fr] min-[1100px]:h-[calc(100svh-4.75rem)] min-[1100px]:overflow-hidden">
      <ProfileSidebar />
      <div className="min-w-0 min-[1100px]:overflow-y-auto">
        <div className="mx-auto w-full max-w-[1400px] px-3 py-5 sm:px-8 sm:py-10">
          <header className="mb-7">
            <ProfileBackLink />
            <h1 className="text-[25px] font-semibold tracking-[-0.025em] sm:text-[29px]">
              {editing ? t("editTitle") : t("title")}
            </h1>
            <p className="mt-1 text-[12px] text-body">{t("subtitle")}</p>
          </header>

          {loading ? (
            <div className="grid min-h-80 place-items-center">
              <div className="flex items-center gap-3 text-sm font-medium text-muted">
                <span className="size-5 animate-spin rounded-full border-2 border-[#efc3ca] border-t-brand" />
                {t("loading")}
              </div>
            </div>
          ) : loadError || !user ? (
            <div role="alert" className="rounded-xl bg-card p-6 text-[13px] text-brand shadow-card">
              {loadError || t("loadError")}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-[minmax(190px,0.72fr)_minmax(0,2fr)] sm:gap-6">
              <div className="space-y-6">
                <ProfilePhotoManager user={user} />
                <PrivacyNotice />
              </div>
              <div className="space-y-6">
                {editing ? <EditProfileForm user={user} /> : <ProfileDetails user={user} />}
                <SummaryCards
                  addresses={addresses}
                  savedCard={
                    savedCards.data?.cards.find((card) => card.isDefault) ??
                    savedCards.data?.cards[0]
                  }
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
