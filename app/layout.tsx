import type { Metadata } from "next";
import localFont from "next/font/local";
import { getLocale, getMessages, getTimeZone } from "next-intl/server";
import { AppProviders } from "@/providers/AppProviders";
import "./globals.css";

// Self-hosted (latin + latin-ext) so builds never depend on fetching Google Fonts.
const inter = localFont({
  src: "./fonts/inter-variable.woff2",
  variable: "--font-sans",
  weight: "100 900",
  display: "swap",
});

const poppins = localFont({
  src: [
    { path: "./fonts/poppins-400.woff2", weight: "400", style: "normal" },
    { path: "./fonts/poppins-500.woff2", weight: "500", style: "normal" },
    { path: "./fonts/poppins-600.woff2", weight: "600", style: "normal" },
    { path: "./fonts/poppins-700.woff2", weight: "700", style: "normal" },
    { path: "./fonts/poppins-800.woff2", weight: "800", style: "normal" },
  ],
  variable: "--font-display",
  display: "swap",
});

const cinzel = localFont({
  src: "./fonts/cinzel-variable.woff2",
  variable: "--font-wordmark",
  weight: "400 900",
  display: "swap",
});

export const metadata: Metadata = {
  manifest: "/manifest.webmanifest",
  title: "SIPP — Local delivery in Costa Rica",
  description:
    "Order food, groceries, drinks, and everyday essentials from local businesses in Costa Rica's coastal communities.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const locale = await getLocale();
  const messages = await getMessages();
  const timeZone = await getTimeZone();

  return (
    <html
      lang={locale}
      className={`${inter.variable} ${poppins.variable} ${cinzel.variable} antialiased`}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      {/* Extensions (e.g. ColorZilla's cz-shortcut-listen) add body attributes
          before hydration; ignore those attribute-only differences. */}
      <body suppressHydrationWarning>
        <AppProviders
          locale={locale}
          messages={messages}
          timeZone={timeZone}
        >
          {children}
        </AppProviders>
      </body>
    </html>
  );
}
