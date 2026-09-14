"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";

const subscribeToHydration = () => () => undefined;
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const t = useTranslations("common");
  const mounted = useSyncExternalStore(
    subscribeToHydration,
    getClientSnapshot,
    getServerSnapshot,
  );

  const isDark = mounted && resolvedTheme === "dark";

  const toggleTheme = () => {
    const hasDarkClass = document.documentElement.classList.contains("dark");
    setTheme(hasDarkClass ? "light" : "dark");
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? t("themeLight") : t("themeDark")}
      aria-pressed={isDark}
      title={isDark ? t("themeLight") : t("themeDark")}
      className="grid size-9 place-items-center rounded-full text-foreground transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
    >
      {isDark ? (
        <svg viewBox="0 0 24 24" className="size-[18px] fill-none stroke-current stroke-[1.8]" aria-hidden="true">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2.2M12 19.8V22M2 12h2.2M19.8 12H22M4.9 4.9l1.6 1.6M17.5 17.5l1.6 1.6M19.1 4.9l-1.6 1.6M6.5 17.5l-1.6 1.6" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" className="size-[18px] fill-none stroke-current stroke-[1.8]" aria-hidden="true">
          <path d="M20.4 15.3A8.5 8.5 0 0 1 8.7 3.6 8.5 8.5 0 1 0 20.4 15.3Z" />
        </svg>
      )}
    </button>
  );
}
