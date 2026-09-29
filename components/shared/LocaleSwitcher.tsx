"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import { Icon } from "@/components/shared/brand/Icon";
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
    <label className="relative inline-flex items-center">
      <span className="sr-only">{t("language")}</span>
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
        className="h-9 appearance-none rounded-full border border-line bg-surface py-1 pl-3 pr-8 text-xs font-semibold text-foreground outline-none transition-colors focus:border-brand"
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
        className="pointer-events-none absolute right-2.5 size-3 text-foreground"
      />
    </label>
  );
}
