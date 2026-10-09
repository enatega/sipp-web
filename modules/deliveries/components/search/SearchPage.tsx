"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Footer } from "@/components/shared/app-shell/Footer";
import { Header } from "@/components/shared/app-shell/Header";
import { useActionToast } from "@/components/shared/useActionToast";
import { useSessionQuery } from "@/modules/account";
import { searchApi } from "@/modules/deliveries/api/search";
import { StoreCard } from "@/modules/deliveries/components/discovery/StoreCard";
import { SearchProductCard } from "@/modules/deliveries/components/search/SearchProductCard";
import { useDiscoveryLocation } from "@/modules/deliveries/hooks/useDiscoveryQueries";
import {
  useClearRecentSearchesMutation,
  useRemoveRecentSearchMutation,
  useSaveRecentSearchMutation,
} from "@/modules/deliveries/hooks/useSearchMutations";
import {
  useProductSearchQuery,
  useRecentSearchesQuery,
  useSearchRecommendationsQuery,
  useStoreSearchQuery,
} from "@/modules/deliveries/hooks/useSearchQueries";
import type { RecentSearchItem, SearchMeta, SearchRecommendation } from "@/modules/deliveries/types/search";

/** Results for the query typed into the header search; the page has no field of its own. */
export function SearchPage() {
  const t = useTranslations("deliveries.search");
  const router = useRouter();
  const params = useSearchParams();
  const urlQuery = params.get("q")?.trim() ?? "";
  const [isOnline, setIsOnline] = useState(true);
  const session = useSessionQuery();
  const isAuthenticated = session.data?.authenticated === true;
  const { location, isLocationReady } = useDiscoveryLocation(isAuthenticated);
  const products = useProductSearchQuery(urlQuery, location);
  const stores = useStoreSearchQuery(urlQuery, location);
  const recommendations = useSearchRecommendationsQuery();
  const recentSearches = useRecentSearchesQuery(isAuthenticated);
  const { mutate: saveRecentSearchTerm } = useSaveRecentSearchMutation();
  const removeRecentSearch = useRemoveRecentSearchMutation();
  const clearRecentSearches = useClearRecentSearchesMutation();
  const notify = useActionToast();

  useEffect(() => {
    if (!urlQuery || !isAuthenticated) return;
    saveRecentSearchTerm(urlQuery);
  }, [urlQuery, isAuthenticated, saveRecentSearchTerm]);
  useEffect(() => {
    const sync = () => setIsOnline(navigator.onLine);
    sync();
    window.addEventListener("online", sync);
    window.addEventListener("offline", sync);
    return () => {
      window.removeEventListener("online", sync);
      window.removeEventListener("offline", sync);
    };
  }, []);

  const productItems = products.data?.pages.flatMap((page) =>
    page.items.map((item, index) => ({
      item,
      meta: page.searchMeta,
      position: page.offset + index + 1,
    })),
  ) ?? [];
  const storeItems = stores.data?.pages.flatMap((page) =>
    page.items.map((item, index) => ({
      item,
      meta: page.searchMeta,
      position: page.offset + index + 1,
    })),
  ) ?? [];
  const productTotal = products.data?.pages[0]?.total ?? 0;
  const storeTotal = stores.data?.pages[0]?.total ?? 0;
  const status = !isOnline
    ? t("offline")
    : !urlQuery
        ? t("hint")
        : products.isPending || stores.isPending
          ? t("loading")
          : products.isError || stores.isError
            ? t("error")
            : t("resultCount", { count: productTotal + storeTotal });

  const selectSuggestion = (value: string) => {
    router.push(`/search?q=${encodeURIComponent(value.trim())}`);
  };

  const track = (meta: SearchMeta | undefined, resourceType: "product" | "store", objectId: string, position: number) => {
    if (!meta?.queryId) return;
    void searchApi.event({
      eventType: "click",
      resourceType,
      queryId: meta.queryId,
      objectId,
      position,
      eventName: resourceType === "store" ? "Store Opened" : "Product Opened",
    }).catch(() => undefined);
  };

  return (
    <>
      <Header />
      <main className="min-h-[70vh] bg-[linear-gradient(180deg,var(--soft-surface)_0,transparent_480px)] pb-16">
        <div className="app-wrap py-6 sm:py-10">
          <h1 className="font-heading text-2xl font-bold tracking-[-0.02em] text-ink [overflow-wrap:anywhere] sm:text-3xl">
            {urlQuery ? t("resultsTitle", { query: urlQuery }) : t("title")}
          </h1>
          <p aria-live="polite" className="mt-1.5 text-sm text-muted">{status}</p>

          {!isLocationReady ? <SearchSkeleton /> : !location ? (
            <Notice>{t("chooseLocation")}</Notice>
          ) : !isOnline ? (
            <Notice>{t("offline")}</Notice>
          ) : !urlQuery ? (
            <IdleSuggestions
              isAuthenticated={isAuthenticated}
              onClear={() => clearRecentSearches.mutate(undefined, { onError: (caught) => notify.error(caught, "recentSearchUpdateFailed") })}
              onRemove={(id) => removeRecentSearch.mutate(id, { onError: (caught) => notify.error(caught, "recentSearchUpdateFailed") })}
              onSelect={selectSuggestion}
              recentSearches={recentSearches.data ?? []}
              recommendations={recommendations.data ?? []}
              t={t}
            />
          ) : (
            <div className="mt-6 space-y-10 sm:mt-8">
              {stores.isPending || stores.isError || storeItems.length ? (
                <section aria-labelledby="search-stores-heading">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h2 className="font-heading text-xl font-bold text-ink" id="search-stores-heading">{t("stores")}</h2>
                    {storeTotal > 6 ? <Link className="text-sm font-semibold text-brand hover:underline" href={`/search/stores?q=${encodeURIComponent(urlQuery)}&page=1`}>{t("seeAllStores")}</Link> : null}
                  </div>
                  {stores.isPending ? <SearchSkeleton /> : stores.isError ? (
                    <Notice><p>{t("error")}</p><button className="mt-3 font-semibold text-brand hover:underline" onClick={() => void stores.refetch()} type="button">{t("retry")}</button></Notice>
                  ) : (
                    <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {storeItems.slice(0, 6).map(({ item, meta, position }) => (
                        <StoreCard key={item.storeId} store={item} fluid onOpen={() => track(meta, "store", item.storeId, position)} />
                      ))}
                    </div>
                  )}
                </section>
              ) : null}
              {products.isPending || products.isError || productItems.length ? (
                <section aria-labelledby="search-products-heading">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h2 className="font-heading text-xl font-bold text-ink" id="search-products-heading">{t("products")}</h2>
                    {productTotal > 6 ? <Link className="text-sm font-semibold text-brand hover:underline" href={`/search/products?q=${encodeURIComponent(urlQuery)}&page=1`}>{t("seeAllProducts")}</Link> : null}
                  </div>
                  {products.isPending ? <SearchSkeleton /> : products.isError ? (
                    <Notice><p>{t("error")}</p><button className="mt-3 font-semibold text-brand hover:underline" onClick={() => void products.refetch()} type="button">{t("retry")}</button></Notice>
                  ) : (
                    <div className="mt-5 grid gap-4 sm:gap-5 md:grid-cols-2 xl:grid-cols-3">
                      {productItems.slice(0, 6).map(({ item, meta, position }) => (
                        <SearchProductCard key={`${item.storeId}-${item.productId}`} item={item} location={location} onOpen={() => track(meta, "product", item.productId, position)} />
                      ))}
                    </div>
                  )}
                </section>
              ) : null}
              {!stores.isPending && !products.isPending && !stores.isError && !products.isError && !storeItems.length && !productItems.length ? <Notice>{t("resultCount", { count: 0 })}</Notice> : null}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

function IdleSuggestions({
  isAuthenticated,
  onClear,
  onRemove,
  onSelect,
  recentSearches,
  recommendations,
  t,
}: {
  isAuthenticated: boolean;
  onClear: () => void;
  onRemove: (id: string) => void;
  onSelect: (value: string) => void;
  recentSearches: RecentSearchItem[];
  recommendations: SearchRecommendation[];
  t: ReturnType<typeof useTranslations<"deliveries.search">>;
}) {
  if (!isAuthenticated && recommendations.length === 0) return null;
  return (
    <div className="mt-8 max-w-3xl space-y-8">
      {isAuthenticated && recentSearches.length > 0 ? (
        <section aria-labelledby="recent-searches-heading">
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-heading text-lg font-bold text-ink" id="recent-searches-heading">{t("recentSearches")}</h2>
            <button className="text-sm font-bold text-brand hover:underline" onClick={onClear} type="button">{t("clearRecentSearches")}</button>
          </div>
          <ul className="mt-3 flex flex-wrap gap-2">
            {recentSearches.map((item) => (
              <li className="flex items-center gap-1 rounded-full border border-line bg-card py-1.5 pl-4 pr-2 text-sm text-ink" key={item.id}>
                <button className="font-medium hover:text-brand" onClick={() => onSelect(item.term)} type="button">{item.term}</button>
                <button aria-label={t("removeRecentSearch", { term: item.term })} className="rounded-full p-1 text-muted hover:bg-[var(--soft-surface)] hover:text-ink" onClick={() => onRemove(item.id)} type="button">
                  <X aria-hidden="true" className="size-3.5" />
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {recommendations.length > 0 ? (
        <section aria-labelledby="recommendations-heading">
          <h2 className="font-heading text-lg font-bold text-ink" id="recommendations-heading">{t("recommendedCategories")}</h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {recommendations.map((category) => (
              <li key={category.id}>
                <button className="rounded-full border border-line bg-card px-4 py-1.5 text-sm font-medium text-ink transition hover:border-brand hover:text-brand" onClick={() => onSelect(category.name)} type="button">
                  {category.name}
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

function Notice({ children }: { children: ReactNode }) { return <div className="mt-5 rounded-2xl border border-line bg-card p-6 text-center text-sm text-muted">{children}</div>; }
function SearchSkeleton() { return <div aria-busy="true" className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{Array.from({ length: 4 }, (_, index) => <div className="h-64 animate-pulse rounded-2xl bg-[var(--soft-surface)]" key={index} />)}</div>; }
