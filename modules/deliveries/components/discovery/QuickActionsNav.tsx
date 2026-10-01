import Link from "next/link";
import { ChevronRight, Heart, Repeat2, Store, Tag } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import styles from "./discovery-cards.module.css";

export function QuickActionsNav() {
  const t = useTranslations("deliveries.discovery");
  const actions = [
    { href: "/discovery/all/stores", label: t("quickBrowse"), Icon: Store, tile: "bg-brand/15 text-brand", hover: "hover:ring-brand/45" },
    { href: "/discovery/all/deals", label: t("dealsTitle"), Icon: Tag, tile: "bg-warning-soft text-warning", hover: "hover:ring-warning/45" },
    { href: "/orders", label: t("quickOrders"), Icon: Repeat2, tile: "bg-success-soft text-success", hover: "hover:ring-success/45" },
    { href: "/favourites", label: t("quickFavourites"), Icon: Heart, tile: "bg-secondary/10 text-secondary", hover: "hover:ring-secondary/40" },
  ];

  return (
    <nav aria-label={t("quickActionsTitle")}>
      <ul className="grid grid-cols-2 gap-2.5 sm:gap-3 md:grid-cols-4">
        {actions.map(({ href, label, Icon, tile, hover }, index) => (
          <li
            className={styles.cardEnter}
            key={href}
            style={{ "--enter-delay": `${index * 60}ms` } as React.CSSProperties}
          >
            <Link
              className={cn(
                "group flex h-full min-h-[72px] items-center gap-3 rounded-2xl bg-card px-3 py-3 shadow-rail-card ring-1 ring-line transition-[translate,box-shadow] duration-300 ease-out hover:-translate-y-1 hover:shadow-pop focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand sm:px-4",
                hover,
              )}
              href={href}
            >
              <span className={cn("grid size-11 shrink-0 place-items-center rounded-xl", tile)}>
                <Icon aria-hidden="true" className={cn(styles.iconWiggle, "size-5")} strokeWidth={2} />
              </span>
              <span className="min-w-0 flex-1 text-[13px] font-bold leading-5 text-ink sm:text-sm">
                {label}
              </span>
              <ChevronRight
                aria-hidden="true"
                className="hidden size-4 shrink-0 text-muted transition-[translate,color] duration-300 group-hover:translate-x-1 group-hover:text-ink sm:block"
              />
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
