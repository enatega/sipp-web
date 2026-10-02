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
      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {actions.map(({ href, label, description, Icon, tone }, index) => (
          <li
            className={styles.cardEnter}
            key={href}
            style={{ "--enter-delay": `${index * 60}ms` } as React.CSSProperties}
          >
            <Link
              className="group flex h-full min-h-22 items-center gap-3 rounded-[20px] bg-card p-3 pr-3.5 shadow-rail-card ring-1 ring-line transition-[translate,box-shadow] duration-300 ease-out hover:-translate-y-1 hover:shadow-pop focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand sm:gap-4"
              href={href}
            >
              <span className={cn(styles.glossHalo, tone, "grid size-16 shrink-0 place-items-center rounded-2xl")}>
                <span className={cn(styles.glossBadge, "grid size-11 place-items-center rounded-[14px]")}>
                  <Icon aria-hidden="true" className="size-5" fill={Icon === Heart ? "currentColor" : "none"} strokeWidth={2.4} />
                </span>
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-heading text-sm font-extrabold leading-5 text-ink">
                  {label}
                </span>
                <span className="mt-0.5 block text-xs leading-[1.35] text-muted">
                  {description}
                </span>
              </span>
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-soft-surface text-ink ring-1 ring-line transition-[translate,background-color] duration-300 group-hover:translate-x-0.5 group-hover:bg-brand/15">
                <ChevronRight aria-hidden="true" className="size-4" />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
