import Link from "next/link";
import { ArrowRight, Heart } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { formatAppCurrency } from "@/config/currency";
import { cn } from "@/lib/utils";
import { DealSparkle } from "@/modules/deliveries/components/discovery/DealSparkle";
import { DeliveryImage } from "@/modules/deliveries/components/discovery/DeliveryImage";
import type { DeliveryStore } from "@/modules/deliveries/types/discovery";
import {
  storeHref,
  storeOfferLabel,
} from "@/modules/deliveries/utils/storeCardLabels";
import styles from "./discovery-cards.module.css";

interface Props {
  store: DeliveryStore;
}

export function DealCard({ store }: Props) {
  const t = useTranslations("deliveries.discovery");
  const format = useFormatter();
  const isClosed = store.isOpen === false || store.isAvailable === false;
  const price =
    typeof store.price === "number" && store.price >= 0 ? store.price : null;
  const discountedPrice =
    price !== null && typeof store.discountedPrice === "number"
      ? store.discountedPrice
      : null;
  const minimumOrder =
    typeof store.minimumOrder === "number" && store.minimumOrder > 0
      ? store.minimumOrder
      : null;
  // A named deal ("Holiday Deal") leads; the store becomes the byline.
  const dealName = store.deal?.trim() || null;
  const title = dealName ?? store.name;
  const byline = dealName ? store.name.trim() : null;
  const category = store.shopTypeName?.trim() || t("storeFallback");
  const offerLabel = storeOfferLabel(
    store,
    (value) => formatAppCurrency(format, value),
    t("off"),
  );
  // Without an amount the label falls back to the deal name, already the title.
  const offer = offerLabel && offerLabel !== title ? offerLabel : null;

  return (
    <Link
      aria-label={t("openStore", { name: store.name })}
      className="group relative isolate flex h-full w-full flex-col items-stretch gap-2.5 overflow-hidden rounded-[1.25rem] bg-card p-2 shadow-[0_10px_30px_color-mix(in_srgb,var(--color-brand)_16%,transparent)] ring-1 ring-white/70 transition-[translate,box-shadow] duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_16px_36px_color-mix(in_srgb,var(--color-brand)_24%,transparent)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand sm:flex-row sm:items-center sm:gap-3.5 sm:rounded-[1.5rem] sm:p-2.5 dark:ring-line"
      href={storeHref(store)}
    >
      {/* Soft "cloud" shapes behind the copy, as in the reference design. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-16 right-[-12%] -z-1 aspect-square w-[55%] rounded-full bg-[radial-gradient(circle,color-mix(in_srgb,var(--color-brand)_12%,transparent),transparent_70%)]"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -right-8 -top-12 -z-1 aspect-square w-[38%] rounded-full bg-[radial-gradient(circle,color-mix(in_srgb,var(--color-brand)_9%,transparent),transparent_70%)]"
      />

      <div className="relative w-full shrink-0 overflow-hidden rounded-[0.9rem] sm:w-40 sm:rounded-[1.1rem] lg:w-44">
        <DeliveryImage
          alt={store.name}
          className={cn("aspect-[16/9] w-full sm:aspect-[4/3]", isClosed && "grayscale")}
          imageClassName="transition-[scale] duration-700 ease-out group-hover:scale-110"
          sizes="(max-width: 560px) 240px, 176px"
          src={store.coverImage ?? store.logo}
        />
        <span aria-hidden="true" className={styles.shine} />
        {offer ? (
          <span className="absolute left-2 top-2 z-2 flex max-w-[calc(100%-1rem)] items-start sm:left-3 sm:top-3">
            <span className="truncate rounded-full bg-secondary px-2 py-0.5 font-heading text-[10px] font-extrabold uppercase tracking-wide text-white shadow-[0_6px_14px_color-mix(in_srgb,var(--color-secondary)_35%,transparent)] transition-[scale] duration-300 group-hover:scale-105 sm:px-2.5 sm:py-1 sm:text-[11px]">
              {offer}
            </span>
            <DealSparkle className="-ml-0.5 -mt-1 size-3.5 shrink-0 -scale-x-100 text-white sm:size-4" />
          </span>
        ) : null}
        {store.isFavorite ? (
          <span className="absolute bottom-2 right-2 z-2 grid size-7 place-items-center rounded-full bg-card/95 text-secondary shadow-sm">
            <Heart aria-hidden="true" className="size-3.5 fill-current" />
          </span>
        ) : null}
        {isClosed ? (
          <span className="absolute inset-0 z-2 grid place-items-center bg-black/45">
            <b className="rounded-full bg-surface px-3 py-1.5 text-[10px] uppercase tracking-[0.12em] text-ink">
              {t("closed")}
            </b>
          </span>
        ) : null}
      </div>

      <div className="flex min-w-0 flex-1 items-center gap-2 px-1 pb-1 sm:gap-2 sm:px-0 sm:py-1">
        <div className="min-w-0 flex-1">
          <span className="block truncate text-[9px] font-bold uppercase tracking-[0.2em] text-muted sm:text-[10px]">
            {category}
          </span>
          <h3 className="mt-0.5 truncate font-heading text-sm font-extrabold leading-tight tracking-[-0.01em] text-ink sm:text-base">
            {title}
          </h3>
          {byline ? (
            <p className="truncate text-[11px] text-muted sm:text-xs">{byline}</p>
          ) : null}
          {price !== null ? (
            <p className="mt-2 flex min-w-0 flex-wrap items-baseline gap-x-2 border-l-2 border-line pl-2.5 tabular-nums sm:mt-2">
              <b className="font-heading text-[13px] font-extrabold text-ink sm:text-sm">
                {formatAppCurrency(format, discountedPrice ?? price)}
              </b>
              {discountedPrice !== null ? (
                <s className="text-xs font-medium text-muted decoration-secondary/70">
                  {formatAppCurrency(format, price)}
                </s>
              ) : null}
            </p>
          ) : minimumOrder !== null ? (
            <p className="mt-2 truncate border-l-2 border-line pl-2.5 text-[11px] text-muted sm:mt-2">
              {t.rich("minimumOrder", {
                amount: () => (
                  <b className="font-heading font-extrabold text-ink tabular-nums">
                    {formatAppCurrency(format, minimumOrder)}
                  </b>
                ),
              })}
            </p>
          ) : (
            <p className="mt-2 truncate border-l-2 border-line pl-2.5 text-[11px] font-bold text-brand sm:mt-2">
              {t("exploreOffer")}
            </p>
          )}
        </div>

        <span
          aria-hidden="true"
          className="grid size-8 shrink-0 place-items-center rounded-full bg-[linear-gradient(160deg,var(--color-brand)_0%,var(--color-brand-deep)_85%)] text-white shadow-[0_10px_22px_color-mix(in_srgb,var(--color-brand-deep)_45%,transparent),0_2px_6px_color-mix(in_srgb,var(--color-brand-deep)_30%,transparent),inset_0_2px_1px_rgb(255_255_255/0.4)] transition-[scale,translate] duration-300 group-hover:translate-x-0.5 group-hover:scale-110 sm:size-10"
        >
          <ArrowRight className="size-4" strokeWidth={2.6} />
        </span>
      </div>
    </Link>
  );
}
