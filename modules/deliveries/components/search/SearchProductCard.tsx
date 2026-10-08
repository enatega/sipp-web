"use client";

import Link from "next/link";
import { ArrowUpRight, ChevronRight, Star } from "lucide-react";
import { useFormatter, useLocale, useTranslations } from "next-intl";
import { formatAppCurrency } from "@/config/currency";
import { DeliveryImage } from "@/modules/deliveries/components/discovery/DeliveryImage";
import {
  useSearchResultProductQuery,
  useSearchResultStoreQuery,
} from "@/modules/deliveries/hooks/useSearchQueries";
import { getLocalizedProductName } from "@/modules/deliveries/utils/productTranslation";
import type { DiscoveryLocation } from "@/modules/deliveries/types/discovery";
import type { SearchProduct } from "@/modules/deliveries/types/search";

interface Props {
  item: SearchProduct;
  location: DiscoveryLocation | null;
  onOpen: () => void;
}

export function SearchProductCard({ item, location, onOpen }: Props) {
  const t = useTranslations("deliveries.search");
  const locale = useLocale();
  const format = useFormatter();
  const store = useSearchResultStoreQuery(item.storeId, location);
  const product = useSearchResultProductQuery(item.productId);

  const productName = getLocalizedProductName(
    { name: item.productName, nameTranslations: item.productNameTranslations },
    locale,
  );
  const storeName = store.data?.name || item.storeName;
  const storeLogo = store.data?.logo ?? item.storeLogo ?? item.storeImage;
  const rating = store.data?.averageRating ?? 0;
  const isClosed = store.data ? !store.data.isAvailable : false;
  const description = product.data?.description?.trim();
  const deal = product.data?.deal;
  const isOutOfStock = product.data?.inStock === false;
  const storeHref = `/restaurants/${encodeURIComponent(item.storeSlug || item.storeId)}`;
  const productHref = `${storeHref}?productId=${encodeURIComponent(item.productId)}`;

  return (
    <article className="group/card flex flex-col overflow-hidden rounded-3xl border border-line bg-card shadow-[0_1px_2px_rgba(16,24,40,0.04)] transition duration-300 hover:-translate-y-1 hover:border-brand/30 hover:shadow-[0_18px_40px_-18px_rgba(16,24,40,0.25)]">
      <header className="flex items-center gap-3 border-b border-line px-4 py-3">
        <DeliveryImage
          alt=""
          className="size-10 flex-none overflow-hidden rounded-full border border-line bg-[var(--soft-surface)]"
          sizes="40px"
          src={storeLogo}
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-ink">{storeName}</p>
          {store.isPending && location ? (
            <span className="mt-1 block h-3.5 w-32 animate-pulse rounded bg-[var(--soft-surface)]" />
          ) : store.data ? (
            <div className="mt-0.5 flex min-w-0 items-center gap-1.5 text-xs text-muted">
              <span className={`inline-flex items-center gap-1 font-medium ${isClosed ? "text-danger" : "text-success"}`}>
                <span aria-hidden="true" className={`size-1.5 rounded-full ${isClosed ? "bg-danger" : "bg-success"}`} />
                {isClosed ? t("storeClosed") : t("storeOpen")}
              </span>
              {rating > 0 ? (
                <>
                  <span aria-hidden="true">·</span>
                  <span
                    aria-label={t("storeRating", { rating: format.number(rating, { maximumFractionDigits: 1 }) })}
                    className="inline-flex items-center gap-0.5 font-semibold text-ink"
                  >
                    <Star aria-hidden="true" className="size-3 fill-warning text-warning" />
                    {format.number(rating, { maximumFractionDigits: 1 })}
                  </span>
                </>
              ) : null}
              {store.data.shopTypeName ? (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="truncate">{store.data.shopTypeName}</span>
                </>
              ) : null}
            </div>
          ) : null}
        </div>
        <Link
          className="inline-flex h-8 flex-none items-center gap-0.5 rounded-full bg-brand-soft pl-3 pr-2 text-xs font-semibold text-brand transition-colors hover:bg-brand hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          href={storeHref}
        >
          {t("viewMenu")}
          <ChevronRight aria-hidden="true" className="size-3.5" />
        </Link>
      </header>

      <Link
        className="flex flex-1 gap-4 p-4 focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-brand sm:p-5"
        href={productHref}
        onClick={onOpen}
      >
        <div className="flex min-w-0 flex-1 flex-col">
          <h3 className="line-clamp-2 font-heading text-[17px] font-bold leading-snug text-ink transition-colors group-hover/card:text-brand">
            {productName}
          </h3>
          {product.isPending ? (
            <div className="mt-2 space-y-1.5">
              <span className="block h-3 w-full animate-pulse rounded bg-[var(--soft-surface)]" />
              <span className="block h-3 w-2/3 animate-pulse rounded bg-[var(--soft-surface)]" />
            </div>
          ) : description ? (
            <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-muted">{description}</p>
          ) : null}
          <div className="mt-auto flex flex-wrap items-center gap-2 pt-4">
            <span className="inline-flex h-8 items-center rounded-full bg-[var(--soft-surface)] px-3 text-sm font-bold tabular-nums text-ink">
              {formatAppCurrency(format, deal ? deal.discountedPrice : item.price)}
            </span>
            {deal ? (
              <span className="text-xs tabular-nums text-muted line-through">
                {formatAppCurrency(format, item.price)}
              </span>
            ) : null}
          </div>
        </div>

        <div className="relative size-28 flex-none sm:size-32">
          <DeliveryImage
            alt={productName}
            className={`size-full overflow-hidden rounded-2xl bg-[var(--soft-surface)] ${isClosed || isOutOfStock ? "opacity-70 grayscale" : ""}`}
            imageClassName="transition-transform duration-500 group-hover/card:scale-105"
            sizes="128px"
            src={item.productImage ?? item.storeImage ?? item.storeLogo}
          />
          {isOutOfStock ? (
            <span className="absolute inset-x-1.5 top-1.5 truncate rounded-full bg-black/70 px-2 py-0.5 text-center text-[10px] font-bold uppercase tracking-wide text-white">
              {t("outOfStock")}
            </span>
          ) : null}
          <span
            aria-hidden="true"
            className="absolute -bottom-2 -right-2 grid size-9 place-items-center rounded-full border-4 border-card bg-brand text-ink shadow-md transition-transform duration-300 group-hover/card:scale-110"
          >
            <ArrowUpRight className="size-4" />
          </span>
        </div>
      </Link>
    </article>
  );
}
