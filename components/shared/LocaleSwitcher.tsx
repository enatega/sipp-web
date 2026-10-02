"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import { Icon } from "@/components/shared/brand/Icon";
import { LocaleFlag } from "@/components/shared/LocaleFlag";
import { localeNames, locales, type Locale } from "@/i18n/config";
import { setUserLocale } from "@/lib/locale";
import { requestJson } from "@/services/api/client";

type DeliveryLanguage = {
  code: string;
};

export function LocaleSwitcher() {
  const activeLocale = useLocale() as Locale;
  const t = useTranslations("common");
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [configuredLanguages, setConfiguredLanguages] = useState<
    DeliveryLanguage[] | null
  >(null);

  useEffect(() => {
    let active = true;

    void requestJson<DeliveryLanguage[]>("/api/languages")
      .then((languages) => {
        if (active) setConfiguredLanguages(languages);
      })
      .catch(() => {
        if (active) setConfiguredLanguages([]);
      });

    return () => {
      active = false;
    };
  }, []);

  const activeLocales = useMemo<Locale[]>(() => {
    if (configuredLanguages === null) return [activeLocale];
    if (configuredLanguages.length === 0) {
      return activeLocale === "en"
        ? ["en"]
        : (["en", activeLocale] as Locale[]);
    }

    return locales.filter(
      (locale) =>
        locale === "en" ||
        configuredLanguages.some((language) => language.code === locale),
    );
  }, [activeLocale, configuredLanguages]);

  useEffect(() => {
    if (configuredLanguages?.length && !activeLocales.includes(activeLocale)) {
      startTransition(async () => {
        await setUserLocale("en");
        router.refresh();
      });
    }
  }, [activeLocale, activeLocales, configuredLanguages, router]);

  return (
    <label className="relative inline-flex h-10 items-center rounded-full border border-line bg-card shadow-rail-card transition-[border-color,box-shadow] hover:shadow-pop has-[select:focus-visible]:border-brand has-[select:focus-visible]:ring-2 has-[select:focus-visible]:ring-brand/30">
      <span className="sr-only">{t("language")}</span>
      <LocaleFlag
        className="pointer-events-none absolute left-2.5"
        locale={activeLocale}
      />
      <select
        value={activeLocale}
        disabled={pending}
        onChange={(event) => {
          const locale = event.target.value as Locale;
          startTransition(async () => {
            await setUserLocale(locale);
            router.refresh();
          });
        }}
        className="h-full cursor-pointer appearance-none rounded-full border-0 bg-transparent py-1 pl-9.5 pr-9 text-sm font-semibold text-ink outline-none disabled:cursor-wait disabled:opacity-70"
        aria-label={t("language")}
      >
        {activeLocales.map((locale) => (
          <option key={locale} value={locale}>
            {localeNames[locale]}
          </option>
        ))}
      </select>
      <Icon
        name="chevron"
        className="pointer-events-none absolute right-3.5 size-3 text-ink"
      />
    </label>
  );
}
