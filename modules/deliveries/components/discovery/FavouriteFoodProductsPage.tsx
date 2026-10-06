"use client";

import { LoaderCircle, SearchX } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Footer } from "@/components/shared/app-shell/Footer";
import { Header } from "@/components/shared/app-shell/Header";
import { HistoryBackButton } from "@/components/shared/HistoryBackButton";
import { useSessionQuery } from "@/modules/account";
import { SearchProductCard } from "@/modules/deliveries/components/search/SearchProductCard";
import { FavouriteFoodProductSkeleton } from "./FavouriteFoodProductSkeleton";
import { useDiscoveryLocation } from "@/modules/deliveries/hooks/useDiscoveryQueries";
import { useFavouriteFoodProductsQuery, useFavouriteFoodsQuery } from "@/modules/deliveries/hooks/useFavouriteFoodsQueries";
import { getLocalizedProductName } from "@/modules/deliveries/utils/productTranslation";

interface Props {
  foodId: string;
  shopTypeId: string | null;
}

export function FavouriteFoodProductsPage({ foodId, shopTypeId }: Props) {
  const t = useTranslations("deliveries.favouriteFoods");
  const locale = useLocale();
  const session = useSessionQuery();
  const { location, isLocationReady } = useDiscoveryLocation(session.data?.authenticated === true);
  const foods = useFavouriteFoodsQuery();
  const products = useFavouriteFoodProductsQuery(foodId, location, shopTypeId, isLocationReady);
  const food = foods.data?.find((item) => item.id === foodId);
  const title = food ? getLocalizedProductName(food, locale) : t("productsTitle");
  const items = products.data?.pages.flatMap((page) => page.items) ?? [];
  const total = products.data?.pages[0]?.total ?? 0;

  return <>
    <Header />
    <main className="min-h-[70vh] bg-[linear-gradient(180deg,var(--soft-surface)_0,transparent_480px)] pb-16">
      <div className="app-wrap py-6 sm:py-10">
        <HistoryBackButton />
        <header className="mt-5 border-b border-line pb-6">
          <h1 className="font-heading text-3xl font-extrabold tracking-[-0.03em] text-ink sm:text-4xl">{title}</h1>
          {!products.isPending && !products.isError ? <p aria-live="polite" className="mt-2 text-sm text-muted">{t("resultCount", { count: total })}</p> : null}
        </header>
        <section aria-label={t("productsTitle")} className="mt-6 sm:mt-8">
          {!isLocationReady || products.isPending ? (
            <div aria-busy="true" className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }, (_, index) => <FavouriteFoodProductSkeleton key={index} />)}
              <span className="sr-only">{t("loading")}</span>
            </div>
          ) : products.isError ? (
            <div className="grid min-h-64 place-items-center rounded-2xl bg-card p-8 text-center" role="alert">
              <div><SearchX aria-hidden="true" className="mx-auto size-7 text-muted" /><p className="mt-4 font-semibold text-ink">{t("resultsError")}</p><button className="mt-4 min-h-11 rounded-full bg-brand px-5 text-sm font-bold text-ink hover:bg-brand/85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand" onClick={() => void products.refetch()} type="button">{t("retry")}</button></div>
            </div>
          ) : items.length ? (
            <div className="grid gap-4 sm:gap-5 md:grid-cols-2 xl:grid-cols-3">
              {items.map((item) => <SearchProductCard item={item} key={`${item.storeId}-${item.productId}`} location={location} onOpen={() => undefined} />)}
            </div>
          ) : (
            <div className="grid min-h-64 place-items-center rounded-2xl bg-card p-8 text-center"><div><SearchX aria-hidden="true" className="mx-auto size-7 text-muted" /><p className="mt-4 font-semibold text-ink">{t("empty")}</p></div></div>
          )}
          {products.hasNextPage ? <div className="mt-8 text-center"><button className="inline-flex min-h-11 items-center gap-2 rounded-full bg-brand px-6 text-sm font-bold text-ink hover:bg-brand/85 disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand" disabled={products.isFetchingNextPage} onClick={() => void products.fetchNextPage()} type="button">{products.isFetchingNextPage ? <LoaderCircle aria-hidden="true" className="size-4 animate-spin" /> : null}{t("loadMore")}</button></div> : null}
        </section>
      </div>
    </main>
    <Footer />
  </>;
}
