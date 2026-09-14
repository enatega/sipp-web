"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Icon, type IconName } from "@/components/shared/brand/Icon";

const SIDE_LINKS: Array<{
  labelKey: "profile" | "orders" | "favourites" | "wallet";
  href: string;
  icon: IconName;
}> = [
  { labelKey: "profile", href: "/profile", icon: "user-circle" },
  { labelKey: "orders", href: "/orders", icon: "package" },
  { labelKey: "favourites", href: "/favourites", icon: "star" },
  { labelKey: "wallet", href: "/wallet", icon: "wallet-card" },
];

export function ProfileSidebar() {
  const pathname = usePathname();
  const nav = useTranslations("navigation");

  return (
    <aside className="flex overflow-x-auto border-b border-line bg-[var(--soft-surface)] min-[700px]:sticky min-[700px]:top-16 min-[700px]:h-[calc(100svh-4rem)] min-[700px]:self-start min-[700px]:overflow-x-visible min-[700px]:flex-col min-[700px]:border-b-0 min-[700px]:border-r md:top-[76px] md:h-[calc(100svh-4.75rem)]">
      <nav
        className="flex gap-1 p-3 min-[700px]:flex-col min-[700px]:px-3 min-[700px]:pt-6"
        aria-label={nav("profileNavigation")}
      >
        {SIDE_LINKS.map(({ labelKey, href, icon }) => {
          const active = labelKey === "profile"
            ? pathname.startsWith("/profile")
            : pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={labelKey}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`relative flex min-w-max items-center gap-2 rounded-xl px-2.5 py-2.5 text-[11px] font-medium transition-colors sm:px-3 sm:py-3 sm:text-[12px] min-[700px]:w-full ${
                active
                  ? "bg-card text-brand shadow-card before:absolute before:inset-y-2 before:left-0 before:w-[3px] before:rounded-full before:bg-brand"
                  : "text-muted hover:bg-card hover:text-foreground"
              }`}
            >
              <Icon name={icon} className="size-[17px] flex-none" />
              {nav(labelKey)}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
