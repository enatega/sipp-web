"use client";
import { useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { Logo } from "@/components/shared/brand/Logo";
import { Icon } from "@/components/shared/brand/Icon";
import { AuthMenu, LocationTrigger } from "@/modules/account";
import { LocaleSwitcher } from "@/components/shared/LocaleSwitcher";
import { ThemeToggle } from "@/components/shared/ThemeToggle";

const NAV_LINK =
  "inline-flex items-center gap-1 text-sm font-medium text-ink transition-colors hover:text-brand";

export function Header({ cartCount = 0 }: { cartCount?: number }) {
  const t = useTranslations("navigation");
  const common = useTranslations("common");
  const [servicesOpen, setServicesOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 h-16 bg-surface shadow-[0_2px_14px_rgba(30,15,20,0.06)] md:h-[76px]">
      <div className="mx-auto flex h-full w-[calc(100%-16px)] items-center gap-3 sm:w-[min(1320px,100%-48px)] sm:gap-5">
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:flex-none sm:gap-4">
          <Logo className="flex-none [&_img]:!h-7 sm:[&_img]:!h-10 md:[&_img]:!h-20" />
          <LocationTrigger />
        </div>

        <nav
          className={`absolute left-0 right-0 top-16 flex-col items-stretch gap-[18px] bg-surface px-6 pb-[26px] pt-5 shadow-pop md:static md:ml-auto hidden md:flex-row md:items-center md:gap-[22px] md:bg-transparent md:p-0 md:shadow-none lg:gap-[34px] hidden`}
        >
          <div
            className="md:relative"
            onMouseLeave={() => setServicesOpen(false)}
          >
            <button
              type="button"
              className={NAV_LINK}
              aria-expanded={servicesOpen}
              onClick={() => setServicesOpen((open) => !open)}
              onMouseEnter={() => setServicesOpen(true)}
            >
              {t("services")}
              <Icon name="chevron" className="size-3 flex-none" />
            </button>
            {servicesOpen ? (
              <div className="static flex gap-10 rounded-[10px] bg-surface pt-3.5 md:absolute md:-left-6 md:top-[30px] md:min-w-[260px] md:px-[26px] md:py-[22px] md:shadow-pop">
                {[
                  { group: "MOVE", links: [t("ride"), t("courier")] },
                  {
                    group: "EAT",
                    links: [t("foodDelivery"), t("restaurants"), t("homeMade")],
                  },
                ].map(({ group, links }) => (
                  <div className="flex flex-col gap-2.5" key={group}>
                    <b className="text-xs tracking-[0.08em] text-ink">
                      {group}
                    </b>
                    {links.map((link) => (
                      <a
                        key={link}
                        href="#services"
                        className="whitespace-nowrap text-[13px] text-body hover:text-brand"
                      >
                        {link}
                      </a>
                    ))}
                  </div>
                ))}
              </div>
            ) : null}
          </div>
          <a className={NAV_LINK} href="#about">
            {t("about")}
          </a>
          <a className={NAV_LINK} href="#products">
            {t("investors")}
          </a>
          <div className="flex items-center gap-2 md:hidden">
            <LocaleSwitcher />
            {/* <ThemeToggle /> */}
          </div>
        </nav>

        <div className="ml-auto hidden items-center gap-1 lg:flex">
          <LocaleSwitcher />
          {/* <ThemeToggle /> */}
        </div>

        <Link
          aria-label={common("search")}
          className="grid size-10 flex-none place-items-center rounded-full text-ink transition hover:bg-[var(--soft-surface)] hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          href="/search"
        >
          <Search aria-hidden="true" className="size-5" />
        </Link>

        <div className="flex flex-none items-center">
          <AuthMenu cartCount={cartCount} />
        </div>

        <button
          type="button"
          className="hidden"
          onClick={() => setMobileOpen((open) => !open)}
          aria-expanded={mobileOpen}
          aria-label="Toggle navigation"
        >
          <span className="block h-0.5 w-5 rounded-sm bg-ink" />
          <span className="block h-0.5 w-5 rounded-sm bg-ink" />
          <span className="block h-0.5 w-5 rounded-sm bg-ink" />
        </button>
      </div>
    </header>
  );
}
