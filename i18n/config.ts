export const locales = ["en", "de", "es", "ar", "fr"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

export const localeNames: Record<Locale, string> = {
  en: "English",
  de: "Deutsch",
  es: "Español",
  ar: "العربية",
  fr: "Français",
};

export function isLocale(value: string | undefined): value is Locale {
  return locales.includes(value as Locale);
}
