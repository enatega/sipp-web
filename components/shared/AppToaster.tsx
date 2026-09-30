"use client";

import { useTheme } from "next-themes";
import { Toaster } from "sonner";

/**
 * Mounted once in the app providers so toasts survive client-side
 * navigation, e.g. the redirect that follows a successful login.
 */
export function AppToaster() {
  const { resolvedTheme } = useTheme();

  return (
    <Toaster
      position="top-center"
      duration={3000}
      richColors
      theme={resolvedTheme === "dark" ? "dark" : "light"}
    />
  );
}
