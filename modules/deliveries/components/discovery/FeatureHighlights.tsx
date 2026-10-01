import Link from "next/link";
import { ArrowRight, MapPinned, ShieldCheck, TicketPercent } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { SectionHeading } from "@/modules/deliveries/components/discovery/DiscoverySection";
import { DeliveryRouteIllustration } from "@/modules/deliveries/components/discovery/DeliveryRouteIllustration";
import styles from "./discovery-cards.module.css";

export function FeatureHighlights() {
  const t = useTranslations("deliveries.discovery.features");
  const features = [
    { key: "local", Icon: MapPinned, tile: "bg-success-soft text-success", span: "" },
    { key: "deals", Icon: TicketPercent, tile: "bg-warning-soft text-warning", span: "" },
    { key: "secure", Icon: ShieldCheck, tile: "bg-brand/15 text-brand", span: "lg:col-span-2" },
  ] as const;

  return (
    <section aria-labelledby="discovery-features-title" className="space-y-4">
      <div id="discovery-features-title">
        <SectionHeading title={t("title")} description={t("description")} />
      </div>
      <div className="grid gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Link
          className={cn(
            styles.cardEnter,
            "group relative flex flex-col justify-between gap-5 overflow-hidden rounded-3xl bg-linear-to-br from-brand/25 via-brand/10 to-transparent p-5 ring-1 ring-brand/20 transition-[translate,box-shadow] duration-300 ease-out hover:-translate-y-1 hover:shadow-pop focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-brand sm:p-6 md:row-span-3 lg:col-span-2 lg:row-span-2",
          )}
          href="/orders"
        >
          <DeliveryRouteIllustration />
          <div>
            <h3 className="font-heading text-xl font-extrabold tracking-[-0.02em] text-ink sm:text-2xl">
              {t("trackTitle")}
            </h3>
            <p className="mt-1.5 max-w-md text-sm leading-6 text-body">
              {t("trackDescription")}
            </p>
            <span className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-full bg-card px-4 text-sm font-bold text-ink shadow-rail-card transition-[gap] duration-300 group-hover:gap-3">
              {t("trackAction")}
              <ArrowRight aria-hidden="true" className="size-4 text-brand" />
            </span>
          </div>
        </Link>

        {features.map(({ key, Icon, tile, span }, index) => (
          <article
            className={cn(
              styles.cardEnter,
              "group flex items-start gap-4 rounded-3xl bg-card p-5 shadow-rail-card ring-1 ring-line transition-[translate,box-shadow] duration-300 ease-out hover:-translate-y-1 hover:shadow-pop",
              span,
            )}
            key={key}
            style={{ "--enter-delay": `${(index + 1) * 80}ms` } as React.CSSProperties}
          >
            <span className={cn("grid size-12 shrink-0 place-items-center rounded-2xl", tile)}>
              <Icon aria-hidden="true" className={cn(styles.iconWiggle, "size-6")} strokeWidth={1.9} />
            </span>
            <div className="min-w-0">
              <h3 className="font-heading text-base font-extrabold tracking-[-0.01em] text-ink">
                {t(`${key}Title`)}
              </h3>
              <p className="mt-1 text-[13px] leading-5 text-muted">
                {t(`${key}Description`)}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
