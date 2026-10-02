import Link from "next/link";
import { ChevronRight, Heart, Package, Percent, Store } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import styles from "./discovery-cards.module.css";

export function QuickActionsNav() {
  const t = useTranslations("deliveries.discovery");
  const actions = [
    { href: "/discovery/all/stores", label: t("quickBrowse"), description: t("quickBrowseDescription"), Icon: Store, tone: "" },
    { href: "/discovery/all/deals", label: t("dealsTitle"), description: t("quickDealsDescription"), Icon: Percent, tone: styles.glossOrange },
    { href: "/orders", label: t("quickOrders"), description: t("quickOrdersDescription"), Icon: Package, tone: styles.glossMint },
    { href: "/favourites", label: t("quickFavourites"), description: t("quickFavouritesDescription"), Icon: Heart, tone: styles.glossRose },
  ];

  return (
    <nav aria-label={t("quickActionsTitle")}>
      <ul className="-mx-4 -my-2 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto overscroll-x-contain px-4 py-2 touch-pan-x [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:grid sm:grid-cols-2 sm:my-0 sm:overflow-visible sm:px-0 sm:py-0 lg:grid-cols-4">
        {actions.map(({ href, label, description, Icon, tone }, index) => (
          <li
            className={cn(styles.cardEnter, "shrink-0 snap-start sm:shrink")}
            key={href}
            style={{ "--enter-delay": `${index * 60}ms` } as React.CSSProperties}
          >
            <Link
              className="group flex h-full items-center gap-2.5 rounded-[20px] bg-card p-2 pr-4 sm:min-h-22 sm:gap-3 sm:p-3 sm:pr-3.5 shadow-rail-card ring-1 ring-line transition-[translate,box-shadow] duration-300 ease-out hover:-translate-y-1 hover:shadow-pop focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand sm:gap-4"
              href={href}
            >
              <span className={cn(styles.glossHalo, tone, "grid size-12 shrink-0 place-items-center rounded-2xl sm:size-16")}>
                <span className={cn(styles.glossBadge, "grid size-9 place-items-center rounded-xl sm:size-11 sm:rounded-[14px]")}>
                  <Icon aria-hidden="true" className="size-5" fill={Icon === Heart ? "currentColor" : "none"} strokeWidth={2.4} />
                </span>
              </span>
              <span className="min-w-0 sm:flex-1">
                <span className="block whitespace-nowrap font-heading text-sm font-extrabold leading-5 text-ink sm:whitespace-normal">
                  {label}
                </span>
                <span className="mt-0.5 hidden text-xs leading-[1.35] text-muted sm:block">
                  {description}
                </span>
              </span>
              <span className="hidden size-8 shrink-0 place-items-center rounded-full sm:grid bg-soft-surface text-ink ring-1 ring-line transition-[translate,background-color] duration-300 group-hover:translate-x-0.5 group-hover:bg-brand/15">
                <ChevronRight aria-hidden="true" className="size-4" />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
