"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Footer } from "@/components/shared/app-shell/Footer";
import { Header } from "@/components/shared/app-shell/Header";
import { useSessionQuery } from "@/modules/account";
import { searchApi } from "@/modules/deliveries/api/search";
import { StoreCard } from "@/modules/deliveries/components/discovery/StoreCard";
import { SearchProductCard } from "@/modules/deliveries/components/search/SearchProductCard";
import { useDiscoveryLocation } from "@/modules/deliveries/hooks/useDiscoveryQueries";
import {
  useProductSearchPageQuery,
  useStoreSearchPageQuery,
} from "@/modules/deliveries/hooks/useSearchQueries";
import type { SearchMeta } from "@/modules/deliveries/types/search";

type Resource = "products" | "stores";
const PAGE_SIZE = 12;
const MAX_PAGE = 834;

function pageFromParam(value: string | null) {
  const page = Number(value);
  return Number.isSafeInteger(page) && page >= 1 && page <= MAX_PAGE ? page : 1;
}

function listingHref(resource: Resource, query: string, page: number) {
  return `/search/${resource}?q=${encodeURIComponent(query)}&page=${page}`;
}

export function SearchListingPage({ resource }: { resource: Resource }) {
  const t = useTranslations("deliveries.search");
  const router = useRouter();
  const params = useSearchParams();
  const query = params.get("q")?.trim() ?? "";
  const page = pageFromParam(params.get("page"));
  const session = useSessionQuery();
  const { location, isLocationReady } = useDiscoveryLocation(session.data?.authenticated === true);
  const products = useProductSearchPageQuery(query, location, page, resource === "products");
  const stores = useStoreSearchPageQuery(query, location, page, resource === "stores");
  const result = resource === "stores" ? stores : products;
  const [isOnline, setIsOnline] = useState(true);

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

  const track = (meta: SearchMeta | undefined, objectId: string, position: number) => {
    if (!meta?.queryId) return;
    void searchApi.event({
      eventType: "click",
      resourceType: resource === "stores" ? "store" : "product",
      queryId: meta.queryId,
      objectId,
      position,
      eventName: resource === "stores" ? "Store Opened" : "Product Opened",
    }).catch(() => undefined);
  };

  const total = result.data?.total ?? 0;
  const totalPages = Math.min(MAX_PAGE, Math.ceil(total / PAGE_SIZE));
  const lastPage = Math.max(1, totalPages);
  const pageOutOfRange = Boolean(result.data) && page > lastPage;
  useEffect(() => {
    if (pageOutOfRange) router.replace(listingHref(resource, query, lastPage));
  }, [lastPage, pageOutOfRange, query, resource, router]);
  const storeOffset = stores.data?.offset ?? 0;
  const productOffset = products.data?.offset ?? 0;
  const status = !query
    ? t("hint")
    : !isOnline
      ? t("offline")
      : result.isPending
        ? t("loading")
        : result.isError
          ? t("error")
          : t("resultCount", { count: total });

  return (
    <>
      <Header />
      <main className="min-h-[70vh] bg-[linear-gradient(180deg,var(--soft-surface)_0,transparent_480px)] pb-16">
        <div className="app-wrap py-6 sm:py-10">
          <Link className="text-sm font-semibold text-brand hover:underline" href={`/search?q=${encodeURIComponent(query)}`}>
            {t("backToResults")}
          </Link>
          <h1 className="mt-5 font-heading text-2xl font-bold text-ink sm:text-3xl">{t(resource)}</h1>
          <p className="mt-1.5 text-sm text-muted">{query ? t("resultsTitle", { query }) : t("hint")}</p>
          <p aria-live="polite" className="mt-1 text-sm text-muted">{status}</p>

          {!isLocationReady ? <SearchSkeleton /> : !location ? (
            <Notice>{t("chooseLocation")}</Notice>
          ) : !isOnline ? (
            <Notice>{t("offline")}</Notice>
          ) : !query ? (
            <Notice>{t("hint")}</Notice>
          ) : result.isPending || pageOutOfRange ? (
            <SearchSkeleton />
          ) : result.isError ? (
            <Notice>
              <p>{t("error")}</p>
              <button className="mt-3 font-semibold text-brand hover:underline" onClick={() => void result.refetch()} type="button">{t("retry")}</button>
            </Notice>
          ) : resource === "stores" && stores.data?.items.length ? (
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {stores.data.items.map((store, index) => (
                <StoreCard
                  key={store.storeId}
                  store={store}
                  fluid
                  onOpen={() => track(stores.data?.searchMeta, store.storeId, storeOffset + index + 1)}
                />
              ))}
            </div>
          ) : resource === "products" && products.data?.items.length ? (
            <div className="mt-6 grid gap-4 sm:gap-5 md:grid-cols-2 xl:grid-cols-3">
              {products.data.items.map((product, index) => (
                <SearchProductCard
                  key={`${product.storeId}-${product.productId}`}
                  item={product}
                  location={location}
                  onOpen={() => track(products.data?.searchMeta, product.productId, productOffset + index + 1)}
                />
              ))}
            </div>
          ) : (
            <Notice>{t(resource === "stores" ? "noStores" : "noProducts")}</Notice>
          )}

          {query && isOnline && !result.isPending && !result.isError && !pageOutOfRange && totalPages > 1 ? (
            <Pagination resource={resource} query={query} current={page} total={totalPages} />
          ) : null}
        </div>
      </main>
      <Footer />
    </>
  );
}

function Pagination({ resource, query, current, total }: { resource: Resource; query: string; current: number; total: number }) {
  const t = useTranslations("deliveries.search");
  const first = Math.max(1, Math.min(current - 2, total - 4));
  const last = Math.min(total, first + 4);
  const pages = Array.from({ length: last - first + 1 }, (_, index) => first + index);
  const linkClass = "inline-flex min-h-10 min-w-10 items-center justify-center rounded-full border border-line bg-card px-3 text-sm font-semibold text-ink hover:border-brand focus-visible:outline-2 focus-visible:outline-brand";
  return (
    <nav aria-label={t("paginationLabel")} className="mt-9 flex flex-wrap items-center justify-center gap-2">
      {current > 1 ? <Link className={linkClass} href={listingHref(resource, query, current - 1)}>{t("previousPage")}</Link> : null}
      {pages.map((page) => (
        <Link
          aria-current={page === current ? "page" : undefined}
          aria-label={t("pageLabel", { page })}
          className={`${linkClass} ${page === current ? "border-brand bg-brand-soft text-brand" : ""}`}
          href={listingHref(resource, query, page)}
          key={page}
        >
          {page}
        </Link>
      ))}
      {current < total ? <Link className={linkClass} href={listingHref(resource, query, current + 1)}>{t("nextPage")}</Link> : null}
    </nav>
  );
}

function Notice({ children }: { children: React.ReactNode }) {
  return <div className="mt-6 rounded-2xl border border-line bg-card p-6 text-center text-sm text-muted">{children}</div>;
}

function SearchSkeleton() {
  return <div aria-busy="true" className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 6 }, (_, index) => <div className="h-64 animate-pulse rounded-2xl bg-[var(--soft-surface)]" key={index} />)}</div>;
}
