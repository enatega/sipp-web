"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Icon } from "@/components/shared/brand/Icon";
import { localeNames, locales, type Locale } from "@/i18n/config";
import { setUserLocale } from "@/lib/locale";

export function LocaleSwitcher() {
  const activeLocale = useLocale() as Locale;
  const t = useTranslations("common");
  const router = useRouter();
  const [pending, startTransition] = useTransition();

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
        {locales.map((locale) => (
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
