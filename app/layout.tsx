import type { Metadata } from "next";
import { Inter, Poppins, Cinzel } from "next/font/google";
import { getLocale, getMessages, getTimeZone } from "next-intl/server";
import { AppProviders } from "@/providers/AppProviders";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const poppins = Poppins({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const cinzel = Cinzel({
  variable: "--font-wordmark",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
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
      <body>
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
