"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { Filter, LayoutGrid, LoaderCircle, Map, Search, SlidersHorizontal, Tag, X } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Header } from "@/components/shared/app-shell/Header";
import { HistoryBackButton } from "@/components/shared/HistoryBackButton";
import { useSessionQuery } from "@/modules/account";
import { loginHref } from "@/modules/account/utils/authRedirect";
import { discoveryApi } from "@/modules/deliveries/api/discovery";
import { useDiscoveryLocation, useShopTypesQuery } from "@/modules/deliveries/hooks/useDiscoveryQueries";
import type { DeliveryOrderAgainProduct, DeliveryShopType, DeliveryStore, DeliveryTopBrand, DiscoveryPriceTier, DiscoveryScrollPage, DiscoverySort, DiscoveryStock } from "@/modules/deliveries/types/discovery";
import { decodeDisplayText } from "@/modules/deliveries/utils/discoveryMappers";
import { DeliveryImage } from "./DeliveryImage";
import { FavouriteFoodsCarousel } from "./FavouriteFoodsCarousel";
import { DiscoveryFilterDrawer, type DiscoveryFilterValues } from "./DiscoveryFilterDrawer";
import { OrderAgainProductCard } from "./OrderAgainProductCard";
import { DiscoveryStoresMap } from "./DiscoveryStoresMap";
import { StoreCard } from "./StoreCard";

export type DiscoverySeeAllKind = "nearby" | "deals" | "shop-types" | "top-brands" | "order-again" | "stores";
type SeeAllItem = DeliveryStore | DeliveryShopType | DeliveryTopBrand | DeliveryOrderAgainProduct;

const STORE_KINDS = new Set<DiscoverySeeAllKind>(["nearby", "deals", "stores"]);

function useDebounced(value: string) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value.trim()), 350);
    return () => window.clearTimeout(timer);
  }, [value]);
  return debounced;
}

function BrandCard({ brand }: { brand: DeliveryTopBrand }) {
  const t = useTranslations("deliveries.discovery");
  return (
    <article className="overflow-hidden rounded-2xl bg-card shadow-sm">
      <DeliveryImage alt={brand.name} className="aspect-[4/3] w-full" sizes="260px" src={brand.logo} />
      <div className="p-4">
        <h2 className="font-heading text-sm font-bold text-ink">{brand.name}</h2>
        {brand.dealAmount || brand.deal ? (
          <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-brand">
            <Tag aria-hidden="true" className="size-3.5" />
            {brand.dealAmount ? `${brand.dealAmount}${brand.dealType === "percentage" ? "%" : ""} ${t("off")}` : brand.deal}
          </p>
        ) : null}
      </div>
    </article>
  );
}

function ShopTypeCard({ item }: { item: DeliveryShopType }) {
  return (
    <Link
      className="group block overflow-hidden rounded-2xl bg-card shadow-sm transition-transform hover:-translate-y-1 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-brand"
      href={`/discovery/all/stores?shopTypeId=${encodeURIComponent(item.id)}&title=${encodeURIComponent(decodeDisplayText(item.name))}`}
    >
      <DeliveryImage alt="" className="aspect-[4/3] w-full" imageClassName="transition-transform duration-500 group-hover:scale-105" sizes="260px" src={item.image ?? item.icon} />
      <h2 className="min-h-16 p-4 text-sm font-bold text-ink">{decodeDisplayText(item.name)}</h2>
    </Link>
  );
}

export function DiscoverySeeAllPage({ kind }: { kind: DiscoverySeeAllKind }) {
  const t = useTranslations("deliveries.seeAll");
  const router = useRouter();
  const params = useSearchParams();
  const session = useSessionQuery();
  const authenticated = session.data?.authenticated === true;
  const { location, isLocationReady } = useDiscoveryLocation(authenticated);
  const shopTypes = useShopTypesQuery(kind === "nearby");
  const shopTypeId = params.get("shopTypeId") ?? "";
  const customTitle = params.get("title")?.trim();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounced(search);
  const [stock, setStock] = useState<DiscoveryStock>("all");
  const [priceTiers, setPriceTiers] = useState<DiscoveryPriceTier[]>([]);
  const [sortBy, setSortBy] = useState<DiscoverySort>("recommended");
  const [selectedShopType, setSelectedShopType] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [view, setView] = useState<"grid" | "map">("grid");
  const isStoreKind = STORE_KINDS.has(kind);
  const supportsFilters = kind === "nearby" || kind === "stores";
  const source = kind === "stores" ? "shop-type" : kind === "deals" ? "deals" : "nearby";
  const effectiveShopType = kind === "stores" ? shopTypeId : selectedShopType;

  useEffect(() => {
    if (!session.isPending && !authenticated && kind === "order-again") {
      router.replace(loginHref("/discovery/all/order-again"));
    }
  }, [authenticated, kind, router, session.isPending]);

  const query = useInfiniteQuery<DiscoveryScrollPage<SeeAllItem>>({
    queryKey: ["deliveries", "see-all", kind, debouncedSearch, stock, priceTiers, sortBy, effectiveShopType, location],
    queryFn: async ({ pageParam, signal }) => {
      const offset = Number(pageParam);
      if (isStoreKind) {
        return discoveryApi.browseStores(source, { offset, search: debouncedSearch, stock, priceTiers, sortBy, shopTypeId: effectiveShopType || undefined, location }, signal) as Promise<DiscoveryScrollPage<SeeAllItem>>;
      }
      if (kind === "shop-types") return discoveryApi.browseShopTypes(offset, debouncedSearch, signal) as Promise<DiscoveryScrollPage<SeeAllItem>>;
      if (kind === "top-brands") return discoveryApi.browseTopBrands(offset, debouncedSearch, location, signal) as Promise<DiscoveryScrollPage<SeeAllItem>>;
      return discoveryApi.browseOrderAgain(offset, debouncedSearch, signal) as Promise<DiscoveryScrollPage<SeeAllItem>>;
    },
    initialPageParam: 0,
    enabled: (kind !== "order-again" || authenticated) && isLocationReady && (!isStoreKind || kind === "deals" || Boolean(location)) && (kind !== "stores" || Boolean(shopTypeId)),
    getNextPageParam: (lastPage) => lastPage.isEnd ? undefined : (lastPage.nextOffset ?? undefined),
  });

  const items = useMemo(() => query.data?.pages.flatMap((page) => page.items) ?? [], [query.data]);
  const stores = isStoreKind ? (items as DeliveryStore[]) : [];
  const total = query.data?.pages[0]?.total ?? items.length;
  const activeFilterCount = (stock !== "all" ? 1 : 0) + priceTiers.length + (selectedShopType ? 1 : 0) + (sortBy !== "recommended" ? 1 : 0);
  const title = customTitle || t(`titles.${kind}`);
  const selectedShopTypeName = (shopTypes.data?.items ?? []).find((item) => item.id === selectedShopType)?.name;
  const appliedFilters = [
    ...(stock !== "all" ? [{ key: "stock", label: t(`stock.${stock}`), remove: () => setStock("all") }] : []),
    ...priceTiers.map((tier) => ({ key: `price-${tier}`, label: tier, remove: () => setPriceTiers((current) => current.filter((item) => item !== tier)) })),
    ...(selectedShopTypeName ? [{ key: "shop-type", label: decodeDisplayText(selectedShopTypeName), remove: () => setSelectedShopType("") }] : []),
    ...(sortBy !== "recommended" ? [{ key: "sort", label: t(`sorts.${sortBy}`), remove: () => setSortBy("recommended") }] : []),
  ];

  function clearFilters() {
    setStock("all");
    setPriceTiers([]);
    setSortBy("recommended");
    setSelectedShopType("");
  }

  function applyFilters(value: DiscoveryFilterValues) {
    setStock(value.stock);
    setPriceTiers(value.priceTiers);
    setSortBy(value.sortBy);
    setSelectedShopType(value.shopTypeId);
  }

  return (
    <>
      <Header />
      <main className="min-h-[calc(100svh-4rem)] bg-[linear-gradient(180deg,var(--soft-surface)_0,transparent_430px)] pb-16 md:min-h-[calc(100svh-4.75rem)]">
        <div className="app-wrap py-6 sm:py-9">
          <HistoryBackButton />
          <header className="mt-5 flex flex-col gap-5 border-b border-line pb-7 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="font-heading text-3xl font-extrabold tracking-[-0.03em] text-ink sm:text-4xl">{title}</h1>
              <p className="mt-2 text-sm text-body">{t("resultCount", { count: total })}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {supportsFilters ? (
                <button className="relative inline-flex min-h-11 items-center gap-2 rounded-xl border border-line bg-card px-4 text-xs font-bold text-ink hover:border-brand/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand" onClick={() => setFiltersOpen((value) => !value)} type="button">
                  <Filter aria-hidden="true" className="size-4 text-brand" />{t("filters")}
                  {activeFilterCount ? <span className="grid size-5 place-items-center rounded-full bg-brand text-[10px] text-ink">{activeFilterCount}</span> : null}
                </button>
              ) : null}
              {isStoreKind ? (
                <div className="inline-flex rounded-xl bg-card p-1 shadow-sm">
                  {(["grid", "map"] as const).map((option) => {
                    const Icon = option === "grid" ? LayoutGrid : Map;
                    return (
                      <button aria-label={t(option === "grid" ? "gridView" : "mapView")} aria-pressed={view === option} className={`grid size-9 place-items-center rounded-lg focus-visible:outline-2 focus-visible:outline-brand ${view === option ? "bg-brand text-ink" : "text-muted hover:text-ink"}`} key={option} onClick={() => setView(option)} type="button">
                        <Icon aria-hidden="true" className="size-4" />
                      </button>
                    );
                  })}
                </div>
              ) : null}
            </div>
          </header>

          {kind === "stores" && shopTypeId ? (
            <div className="mt-6 sm:mt-8">
              <FavouriteFoodsCarousel shopTypeId={shopTypeId} />
            </div>
          ) : null}

          <div className="mt-5 flex items-center gap-3 rounded-2xl bg-card p-3 shadow-sm focus-within:ring-4 focus-within:ring-brand/10">
            <Search aria-hidden="true" className="size-5 flex-none text-muted" />
            <label className="sr-only" htmlFor="discovery-search">{t("searchLabel")}</label>
            <input className="min-h-10 min-w-0 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-muted" id="discovery-search" onChange={(event) => setSearch(event.target.value)} placeholder={t("searchPlaceholder")} type="search" value={search} />
          </div>

          {supportsFilters && appliedFilters.length ? (
            <section aria-label={t("appliedFilters")} className="mt-4 flex flex-wrap items-center gap-2">
              <span className="mr-1 text-xs font-bold text-body">{t("appliedFilters")}</span>
              {appliedFilters.map((filter) => (
                <button
                  aria-label={t("removeFilter", { filter: filter.label })}
                  className="inline-flex min-h-9 items-center gap-2 rounded-full border border-brand/20 bg-danger-soft px-3 text-xs font-bold text-brand transition-[background-color,transform] hover:bg-brand/10 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                  key={filter.key}
                  onClick={filter.remove}
                  type="button"
                >
                  {filter.label}
                  <X aria-hidden="true" className="size-3.5" />
                </button>
              ))}
              <button className="min-h-9 px-2 text-xs font-bold text-body underline decoration-1 underline-offset-4 hover:text-brand" onClick={clearFilters} type="button">
                {t("clearAll")}
              </button>
            </section>
          ) : null}

          <section aria-live="polite" className="mt-7">
            {(kind === "order-again" && session.isPending) || query.isPending ? (
              <div className="grid min-h-80 place-items-center"><LoaderCircle aria-hidden="true" className="size-7 animate-spin text-brand" /><span className="sr-only">{t("loading")}</span></div>
            ) : query.isError ? (
              <div className="grid min-h-72 place-items-center rounded-2xl bg-danger-soft p-8 text-center" role="alert">
                <div><SlidersHorizontal className="mx-auto size-7 text-danger" /><h2 className="mt-4 font-bold text-ink">{t("errorTitle")}</h2><p className="mt-2 text-sm text-body">{t("errorDescription")}</p><button className="mt-5 rounded-xl bg-brand px-5 py-3 text-xs font-bold text-ink" onClick={() => void query.refetch()} type="button">{t("retry")}</button></div>
              </div>
            ) : !items.length ? (
              <div className="grid min-h-72 place-items-center rounded-2xl bg-card p-8 text-center shadow-sm">
                <div><Search className="mx-auto size-7 text-muted" /><h2 className="mt-4 font-bold text-ink">{t("emptyTitle")}</h2><p className="mt-2 text-sm text-body">{t("emptyDescription")}</p>{activeFilterCount || search ? <button className="mt-5 text-xs font-bold text-brand underline underline-offset-4" onClick={() => { clearFilters(); setSearch(""); }} type="button">{t("resetSearch")}</button> : null}</div>
              </div>
            ) : view === "map" && isStoreKind ? (
              <DiscoveryStoresMap location={location} stores={stores} />
            ) : (
              <div className={`grid gap-4 ${kind === "shop-types" || kind === "top-brands" ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6" : "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5"}`}>
                {kind === "shop-types" ? (items as DeliveryShopType[]).map((item) => <ShopTypeCard item={item} key={item.id} />) : kind === "top-brands" ? (items as DeliveryTopBrand[]).map((brand, index) => <BrandCard brand={brand} key={`${brand.vendorId ?? brand.name}-${index}`} />) : kind === "order-again" ? (items as DeliveryOrderAgainProduct[]).map((product) => <OrderAgainProductCard key={`${product.storeId}:${product.productId}`} product={product} />) : stores.map((store) => <StoreCard fluid key={store.storeId} store={store} />)}
              </div>
            )}
          </section>

          {query.hasNextPage ? (
            <div className="mt-8 text-center">
              <button className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-brand px-7 text-sm font-bold text-ink shadow-[0_8px_20px_rgba(102,192,242,0.18)] hover:bg-brand/85 disabled:opacity-55" disabled={query.isFetchingNextPage} onClick={() => void query.fetchNextPage()} type="button">
                {query.isFetchingNextPage ? <LoaderCircle aria-hidden="true" className="size-4 animate-spin" /> : null}{t("loadMore")}
              </button>
            </div>
          ) : null}
        </div>
      </main>
      {supportsFilters && filtersOpen ? (
        <DiscoveryFilterDrawer
          onApply={applyFilters}
          onClose={() => setFiltersOpen(false)}
          shopTypes={shopTypes.data?.items ?? []}
          showShopTypes={kind === "nearby"}
          value={{
            stock,
            priceTiers,
            sortBy,
            shopTypeId: selectedShopType,
          }}
        />
      ) : null}
    </>
  );
}
