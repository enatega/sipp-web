"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { themeConfig } from "@/config/theme";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return <NextThemesProvider {...themeConfig}>{children}</NextThemesProvider>;
}
