"use client";

import { NextIntlClientProvider } from "next-intl";
import type { AbstractIntlMessages } from "next-intl";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { QueryProvider } from "@/providers/QueryProvider";
import { SessionExpiredModal } from "@/components/shared/SessionExpiredModal";
import { AuthRequiredModal } from "@/components/shared/AuthRequiredModal";
import { ImpersonationBanner } from "@/modules/account/components/auth/ImpersonationBanner";

export function AppProviders({
  children,
  locale,
  messages,
  timeZone,
}: {
  children: React.ReactNode;
  locale: string;
  messages: AbstractIntlMessages;
  timeZone: string;
}) {
  return (
    <NextIntlClientProvider
      locale={locale}
      messages={messages}
      timeZone={timeZone}
    >
      <QueryProvider>
        <ThemeProvider><ImpersonationBanner />{children}<SessionExpiredModal /><AuthRequiredModal /></ThemeProvider>
      </QueryProvider>
    </NextIntlClientProvider>
  );
}
