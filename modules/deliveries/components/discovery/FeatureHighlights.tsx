import Link from "next/link";
import { ArrowRight, ShieldCheck, Store, TicketPercent } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { SectionHeading } from "@/modules/deliveries/components/discovery/DiscoverySection";
import { DeliveryRouteIllustration } from "@/modules/deliveries/components/discovery/DeliveryRouteIllustration";
import styles from "./discovery-cards.module.css";

export function FeatureHighlights() {
  const t = useTranslations("deliveries.discovery.features");
  const features = [
    { key: "local", Icon: Store, tile: styles.softTileMint },
    { key: "deals", Icon: TicketPercent, tile: styles.softTileOrange },
    { key: "secure", Icon: ShieldCheck, tile: "" },
  ] as const;

  return (
    <section aria-labelledby="discovery-features-title" className="space-y-4">
      <div id="discovery-features-title">
        <SectionHeading title={t("title")} description={t("description")} />
      </div>
      <div className="grid gap-3 sm:gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        <Link
          className={cn(
            styles.cardEnter,
            styles.heroScene,
            "group relative isolate flex flex-col justify-end overflow-hidden rounded-[22px] p-4 shadow-rail-card ring-1 ring-line transition-[translate,box-shadow] duration-300 ease-out hover:-translate-y-1 hover:shadow-pop focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-brand sm:min-h-72 sm:rounded-3xl sm:p-7",
          )}
          href="/orders"
        >
          <DeliveryRouteIllustration />
          <div className="relative pt-48 min-[400px]:pt-56 sm:max-w-[46%] sm:pt-0">
            <h3 className="font-heading text-lg font-extrabold tracking-[-0.02em] text-ink min-[400px]:text-xl sm:text-2xl">
              {t("trackTitle")}
            </h3>
            <p className="mt-1 text-[13px] leading-5 text-body sm:mt-1.5 sm:text-sm sm:leading-6">
              {t("trackDescription")}
            </p>
            <span className={cn(styles.scenePill, "mt-3 inline-flex min-h-9 items-center gap-2 rounded-full px-3.5 text-[13px] font-bold sm:mt-4 sm:min-h-10 sm:px-4 sm:text-sm text-ink shadow-rail-card transition-[gap] duration-300 group-hover:gap-3")}>
              {t("trackAction")}
              <ArrowRight aria-hidden="true" className="size-4 text-brand" />
            </span>
          </div>
        </Link>

        <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
          {features.map(({ key, Icon, tile }, index) => (
            <article
              className={cn(
                styles.cardEnter,
                "group flex items-center gap-3 rounded-[22px] bg-card p-4 shadow-rail-card ring-1 ring-line transition-[translate,box-shadow] duration-300 ease-out hover:-translate-y-1 hover:shadow-pop sm:gap-4 sm:rounded-3xl sm:p-6",
                key === "secure" && "sm:col-span-2",
              )}
              key={key}
              style={{ "--enter-delay": `${(index + 1) * 80}ms` } as React.CSSProperties}
            >
              <span className={cn(styles.softTile, tile, "grid size-12 shrink-0 place-items-center rounded-xl ring-1 sm:size-14 sm:rounded-2xl ring-white/70 dark:ring-white/10")}>
                <Icon aria-hidden="true" className={cn(styles.iconWiggle, "size-5 sm:size-6")} strokeWidth={2} />
              </span>
              <div className="min-w-0">
                <h3 className="font-heading text-[15px] font-extrabold tracking-[-0.01em] text-ink sm:text-base">
                  {t(`${key}Title`)}
                </h3>
                <p className="mt-0.5 text-xs leading-[1.125rem] text-muted sm:mt-1 sm:text-[13px] sm:leading-5">
                  {t(`${key}Description`)}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
