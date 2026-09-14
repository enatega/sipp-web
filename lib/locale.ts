"use server";

import { cookies } from "next/headers";
import { defaultLocale, isLocale, type Locale } from "@/i18n/config";

export async function getUserLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const candidate = cookieStore.get("NEXT_LOCALE")?.value;
  return isLocale(candidate) ? candidate : defaultLocale;
}

export async function setUserLocale(locale: Locale) {
  const cookieStore = await cookies();
  cookieStore.set("NEXT_LOCALE", locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}
