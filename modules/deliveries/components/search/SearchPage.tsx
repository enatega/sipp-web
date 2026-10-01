"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { LoaderCircle, Search, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Footer } from "@/components/shared/app-shell/Footer";
import { Header } from "@/components/shared/app-shell/Header";
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

const isDevBuild = process.env.NODE_ENV !== "production";

export function SearchPage() {
  const t = useTranslations("deliveries.search");
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const parameterString = params.toString();
  const urlQuery = params.get("q")?.trim() ?? "";
  const [input, setInput] = useState(urlQuery);
  const [syncedQuery, setSyncedQuery] = useState(urlQuery);
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

  if (urlQuery !== syncedQuery) {
    setSyncedQuery(urlQuery);
    setInput(urlQuery);
  }
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
  useEffect(() => {
    if (input.trim() === urlQuery) return;
    const timeout = window.setTimeout(() => {
      const next = new URLSearchParams(parameterString);
      const value = input.trim();
      if (value) next.set("q", value); else next.delete("q");
      router.replace(`${pathname}?${next}`, { scroll: false });
    }, 400);
    return () => window.clearTimeout(timeout);
  }, [input, parameterString, pathname, router, urlQuery]);

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
  const total = (products.data?.pages[0]?.total ?? 0) + (stores.data?.pages[0]?.total ?? 0);
  const status = useMemo(() => {
    if (!isOnline) return t("offline");
    if (products.isError || stores.isError) return t("error");
    if (urlQuery && (products.isPending || stores.isPending)) return t("loading");
    if (urlQuery) return t("resultCount", { count: total });
    return t("hint");
  }, [isOnline, products.isError, products.isPending, stores.isError, stores.isPending, t, total, urlQuery]);

  const applyQuery = (value: string) => {
    const next = new URLSearchParams(parameterString);
    if (value.trim()) next.set("q", value.trim()); else next.delete("q");
    router.replace(`${pathname}?${next}`, { scroll: false });
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    applyQuery(input);
  };

  const selectSuggestion = (value: string) => {
    setInput(value);
    applyQuery(value);
  };

  const track = (meta: SearchMeta | undefined, resourceType: "product" | "store", objectId: string, position: number) => {
    if (!meta?.queryId) return;
    void searchApi.event({
      eventType: "click",
      resourceType,
      queryId: meta.queryId,
      objectId,
      position,
      eventName: resourceType === "product" ? "Product Opened" : "Store Opened",
    }).catch(() => undefined);
  };

  return (
    <>
      <Header />
      <main className="min-h-[70vh] bg-[linear-gradient(180deg,var(--soft-surface)_0,transparent_480px)] pb-16">
        <div className="app-wrap py-8 sm:py-12">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="font-heading text-3xl font-bold text-ink sm:text-4xl">{t("title")}</h1>
            <p className="mt-2 text-sm text-muted sm:text-base">{t("description")}</p>
            <form className="relative mt-6" onSubmit={submit} role="search">
              <Search aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted" />
              <label className="sr-only" htmlFor="delivery-search">{t("label")}</label>
              <input
                aria-describedby="delivery-search-status"
                autoComplete="off"
                className="h-14 w-full rounded-2xl border border-line bg-card pl-12 pr-5 text-base text-ink shadow-sm outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/15"
                id="delivery-search"
                maxLength={80}
                onChange={(event) => setInput(event.target.value)}
                placeholder={t("placeholder")}
                value={input}
              />
            </form>
            <p aria-live="polite" className="mt-3 text-sm text-muted" id="delivery-search-status">{status}</p>
            {isDevBuild && urlQuery && (products.data || stores.data) ? (
              <p className="mt-1 text-xs text-muted">
                {t("products")}: {products.data?.pages[0]?.searchMeta?.provider === "algolia" ? t("poweredByAlgolia") : t("poweredByDatabase")}
                {" · "}
                {t("stores")}: {stores.data?.pages[0]?.searchMeta?.provider === "algolia" ? t("poweredByAlgolia") : t("poweredByDatabase")}
              </p>
            ) : null}
          </div>

          {!isLocationReady ? <SearchSkeleton /> : !location ? (
            <Notice>{t("chooseLocation")}</Notice>
          ) : !isOnline ? (
            <Notice>{t("offline")}</Notice>
          ) : !urlQuery ? (
            <IdleSuggestions
              isAuthenticated={isAuthenticated}
              onClear={() => clearRecentSearches.mutate()}
              onRemove={(id) => removeRecentSearch.mutate(id)}
              onSelect={selectSuggestion}
              recentSearches={recentSearches.data ?? []}
              recommendations={recommendations.data ?? []}
              t={t}
            />
          ) : (
            <div className="mt-10 space-y-12">
              <section aria-labelledby="product-results-heading">
                <div className="flex items-end justify-between gap-4">
                  <h2 className="font-heading text-2xl font-bold text-ink" id="product-results-heading">{t("products")}</h2>
                  <span className="text-sm text-muted">{products.data?.pages[0]?.total ?? 0}</span>
                </div>
                {products.isPending ? <SearchSkeleton /> : productItems.length ? (
                  <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                    {productItems.map(({ item, meta, position }) => (
                      <SearchProductCard key={`${item.storeId}-${item.productId}`} item={item} location={location} onOpen={() => track(meta, "product", item.productId, position)} />
                    ))}
                  </div>
                ) : <Notice>{products.isError ? t("error") : t("noProducts")}</Notice>}
                {products.hasNextPage ? <LoadMore label={t("moreProducts")} loading={products.isFetchingNextPage} onClick={() => void products.fetchNextPage()} /> : null}
              </section>

              <section aria-labelledby="store-results-heading">
                <div className="flex items-end justify-between gap-4">
                  <h2 className="font-heading text-2xl font-bold text-ink" id="store-results-heading">{t("stores")}</h2>
                  <span className="text-sm text-muted">{stores.data?.pages[0]?.total ?? 0}</span>
                </div>
                {stores.isPending ? <SearchSkeleton /> : storeItems.length ? (
                  <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                    {storeItems.map(({ item, meta, position }) => (
                      <div key={item.storeId} onClick={() => track(meta, "store", item.storeId, position)}><StoreCard fluid store={item} /></div>
                    ))}
                  </div>
                ) : <Notice>{stores.isError ? t("error") : t("noStores")}</Notice>}
                {stores.hasNextPage ? <LoadMore label={t("moreStores")} loading={stores.isFetchingNextPage} onClick={() => void stores.fetchNextPage()} /> : null}
              </section>
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
    <div className="mx-auto mt-10 max-w-3xl space-y-8">
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
function LoadMore({ label, loading, onClick }: { label: string; loading: boolean; onClick: () => void }) { return <div className="mt-6 text-center"><button className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line bg-card px-5 font-bold text-ink transition hover:border-brand disabled:opacity-60" disabled={loading} onClick={onClick} type="button">{loading ? <LoaderCircle aria-hidden="true" className="size-4 animate-spin" /> : null}{label}</button></div>; }
