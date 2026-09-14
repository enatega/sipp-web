import { cookies } from "next/headers";
import { getRequestConfig } from "next-intl/server";
import { defaultLocale, isLocale } from "@/i18n/config";

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const candidate = cookieStore.get("NEXT_LOCALE")?.value;
  const locale = isLocale(candidate) ? candidate : defaultLocale;

  return {
    locale,
    timeZone: "UTC",
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
