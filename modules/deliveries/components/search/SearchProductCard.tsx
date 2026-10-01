"use client";

import Link from "next/link";
import { Star } from "lucide-react";
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
  const rating = store.data?.averageRating ?? 0;
  const description = product.data?.description?.trim();
  const deal = product.data?.deal;
  const storeHref = `/restaurants/${encodeURIComponent(item.storeId)}`;
  const productHref = `${storeHref}?productId=${encodeURIComponent(item.productId)}`;

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-line bg-card shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <header className="flex items-start justify-between gap-3 bg-[var(--soft-surface)] px-5 py-4">
        <div className="min-w-0">
          <h3 className="truncate font-heading text-lg font-bold text-ink">{storeName}</h3>
          <div className="mt-2 h-6">
            {store.isPending && location ? (
              <span className="block h-6 w-28 animate-pulse rounded-md bg-line" />
            ) : store.data ? (
              <span
                className={`inline-flex h-6 items-center rounded-md px-2.5 text-xs font-semibold ${
                  store.data.isAvailable ? "bg-success-soft text-success" : "bg-danger-soft text-danger"
                }`}
              >
                {store.data.isAvailable ? t("storeOpen") : t("storeClosed")}
              </span>
            ) : null}
          </div>
        </div>
        <div className="flex flex-none flex-col items-end gap-2">
          {rating > 0 ? (
            <span
              aria-label={t("storeRating", { rating: format.number(rating, { maximumFractionDigits: 1 }) })}
              className="inline-flex h-7 items-center gap-1 rounded-full bg-warning-soft px-2.5 text-xs font-bold text-ink"
            >
              <Star aria-hidden="true" className="size-3.5 fill-warning text-warning" />
              {format.number(rating, { maximumFractionDigits: 1 })}
            </span>
          ) : null}
          <Link
            className="text-xs font-semibold text-ink underline decoration-2 underline-offset-4 transition-colors hover:text-brand"
            href={storeHref}
          >
            {t("viewMenu")}
          </Link>
        </div>
      </header>

      <Link
        className="group flex flex-1 gap-4 p-5 focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-brand"
        href={productHref}
        onClick={onOpen}
      >
        <div className="flex min-w-0 flex-1 flex-col">
          <h4 className="line-clamp-2 font-heading text-base font-bold text-ink">{productName}</h4>
          {product.isPending ? (
            <span className="mt-2 block h-10 w-full animate-pulse rounded-md bg-[var(--soft-surface)]" />
          ) : description ? (
            <p className="mt-1.5 line-clamp-3 text-sm leading-relaxed text-muted">{description}</p>
          ) : null}
          <div className="mt-auto flex flex-wrap items-baseline gap-2 pt-4">
            {deal ? (
              <>
                <span className="text-lg font-bold text-ink">{formatAppCurrency(format, deal.discountedPrice)}</span>
                <span className="text-sm text-muted line-through">{formatAppCurrency(format, item.price)}</span>
              </>
            ) : (
              <span className="text-lg font-bold text-ink">{formatAppCurrency(format, item.price)}</span>
            )}
          </div>
        </div>
        <DeliveryImage
          alt={productName}
          className="size-28 flex-none overflow-hidden rounded-xl border border-line sm:size-32"
          imageClassName="transition-transform duration-500 group-hover:scale-105"
          sizes="128px"
          src={item.productImage ?? item.storeImage ?? item.storeLogo}
        />
      </Link>
    </article>
  );
}
