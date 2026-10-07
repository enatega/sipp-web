"use client";

import { useEffect, useState } from "react";
import { NextIntlClientProvider } from "next-intl";
import type { AbstractIntlMessages } from "next-intl";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { QueryProvider } from "@/providers/QueryProvider";
import { SessionExpiredModal } from "@/components/shared/SessionExpiredModal";
import { AuthRequiredModal } from "@/components/shared/AuthRequiredModal";
import { AppToaster } from "@/components/shared/AppToaster";
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
  const [localTimeZone, setLocalTimeZone] = useState(timeZone);

  useEffect(() => {
    const browserTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (browserTimeZone) {
      setLocalTimeZone(browserTimeZone);
    }
  }, []);

  return (
    <NextIntlClientProvider
      locale={locale}
      messages={messages}
      timeZone={localTimeZone}
    >
      <QueryProvider>
        <ThemeProvider><ImpersonationBanner />{children}<SessionExpiredModal /><AuthRequiredModal /><AppToaster /></ThemeProvider>
      </QueryProvider>
    </NextIntlClientProvider>
  );
}
