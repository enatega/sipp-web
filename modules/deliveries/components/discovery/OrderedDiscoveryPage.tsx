"use client";

import Link from "next/link";
import { Heart, Repeat2, Store, Tag } from "lucide-react";
import { useTranslations } from "next-intl";
import { Header } from "@/components/shared/app-shell/Header";
import { Footer } from "@/components/shared/app-shell/Footer";
import { useSessionQuery } from "@/modules/account";
import { OffersCarousel } from "./OffersCarousel";
import { OrderAgainSection } from "./OrderAgainSection";
import { ShopTypesSection } from "./ShopTypesSection";
import { StoreRailSection } from "./StoreRailSection";
import { TopBrandsSection } from "./TopBrandsSection";
import { RailSkeleton, SectionHeading, SectionState } from "./DiscoverySection";
import {
  useBannersQuery, useDealsQuery, useDiscoveryLocation, useHomeLayoutQuery,
  useNearbyStoresQuery, useOrderAgainQuery, useShopTypeStoreQueries,
  useShopTypesQuery, useTopBrandsQuery,
} from "@/modules/deliveries/hooks/useDiscoveryQueries";
import { decodeDisplayText } from "@/modules/deliveries/utils/discoveryMappers";

export function DiscoveryPage() {
  const t = useTranslations("deliveries.discovery");
  const session = useSessionQuery();
  const isAuthenticated = session.data?.authenticated === true;
  const { location, isLocationReady } = useDiscoveryLocation(isAuthenticated);
  const layout = useHomeLayoutQuery();
  const shopTypes = useShopTypesQuery(true, true);
  const banners = useBannersQuery(true, true);
  const topBrands = useTopBrandsQuery(location, true, true);
  const nearby = useNearbyStoresQuery(location, true, true);
  const deals = useDealsQuery(true, true, location);
  const orderAgain = useOrderAgainQuery(isAuthenticated, session.data?.user?.id);
  const homeSections = layout.data?.sections ?? [
    { key: 'shop-types', kind: 'shop-types', title: '' },
    { key: 'banners', kind: 'banners', title: '' },
    { key: 'quick-actions', kind: 'quick-actions', title: '' },
    { key: 'top-brands', kind: 'top-brands', title: '' },
    { key: 'nearby-stores', kind: 'nearby-stores', title: '' },
    { key: 'deals', kind: 'deals', title: '' },
    ...(shopTypes.data ?? []).map((type) => ({ key: `shop-type:${type.id}`, kind: 'shop-type-stores', title: type.name })),
    { key: 'order-again', kind: 'order-again', title: '' },
  ];
  const rows = homeSections.filter((section) => section.kind === "shop-type-stores");
  const rowQueries = useShopTypeStoreQueries(
    rows.map((row) => ({ id: row.key.slice("shop-type:".length) })),
    location,
    true,
    true,
  );

  if (session.isPending || layout.isPending) return <DiscoveryPageSkeleton />;

  return <>
    <Header />
    <main className="bg-[linear-gradient(180deg,var(--soft-surface)_0,transparent_520px)] pb-16 sm:pb-20">
      <h1 className="sr-only">{t("pageTitle")}</h1>
      <div className="app-wrap space-y-10 py-5 sm:space-y-12 sm:py-8 lg:space-y-14">
        {homeSections.map((section) => {
          if (section.kind === "banners") {
            return banners.isPending
              ? <div key={section.key} className="h-[290px] animate-pulse rounded-2xl bg-[var(--soft-surface)] sm:h-[380px]" />
              : banners.isError
                ? <section key={section.key} className="space-y-4"><SectionHeading title={t("specialOffers")} /><SectionState title={t("errorTitle")} message={t("errorMessage")} tone="error" actionLabel={t("retry")} onAction={() => void banners.refetch()} /></section>
              : banners.data?.length
                ? <OffersCarousel key={section.key} ctaLabel={t("exploreOffer")} items={banners.data} label={t("specialOffers")} nextLabel={t("nextOffer")} positionLabel={(position) => t("offerPosition", { position })} previousLabel={t("previousOffer")} />
                : <section key={section.key} className="space-y-4"><SectionHeading title={t("specialOffers")} /><SectionState title={t("emptyTitle")} message={t("emptyMessage")} /></section>;
          }
          if (section.kind === "shop-types") {
            return <div key={section.key} className="rounded-3xl bg-[var(--soft-surface)] px-4 py-6 sm:px-6 sm:py-7"><ShopTypesSection emptyMessage={t("shopTypesEmpty")} emptyTitle={t("emptyTitle")} errorMessage={t("errorMessage")} errorTitle={t("errorTitle")} isError={shopTypes.isError} isLoading={shopTypes.isPending} items={shopTypes.data ?? []} onRetry={() => void shopTypes.refetch()} retryLabel={t("retry")} seeAllHref="/discovery/all/shop-types" seeAllLabel={t("seeAll")} description={t("shopTypesDescription")} title={t("shopTypesTitle")} /></div>;
          }
          if (section.kind === "quick-actions") {
            const actions = [
              { href: "/discovery/all/stores", label: t("quickBrowse"), Icon: Store, surface: "bg-[#EAF4FF]", ink: "text-[#255B84]" },
              { href: "/discovery/all/deals", label: t("dealsTitle"), Icon: Tag, surface: "bg-[#FCECF3]", ink: "text-[#8D3E5B]" },
              { href: "/orders", label: t("quickOrders"), Icon: Repeat2, surface: "bg-[#EAF7F1]", ink: "text-[#2F6B56]" },
              { href: "/favourites", label: t("quickFavourites"), Icon: Heart, surface: "bg-[#F2EEFA]", ink: "text-[#5D4B89]" },
            ];
            return <nav key={section.key} aria-label={t("quickActionsTitle")} className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {actions.map(({ href, label, Icon, surface, ink }) => <Link key={href} href={href} className={`${surface} group flex min-h-28 flex-col items-center justify-center gap-2.5 rounded-2xl border border-black/5 px-3 py-4 text-center transition-transform duration-200 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand`}>
                <span className="grid size-12 place-items-center rounded-xl bg-white shadow-sm"><Icon aria-hidden="true" className={`size-6 ${ink}`} strokeWidth={1.8} /></span>
                <span className="text-xs font-semibold leading-4 text-ink sm:text-sm">{label}</span>
              </Link>)}
            </nav>;
          }
          if (section.kind === "top-brands") {
            return <TopBrandsSection key={section.key} emptyMessage={t("emptyMessage")} emptyTitle={t("emptyTitle")} errorMessage={t("errorMessage")} errorTitle={t("errorTitle")} isError={topBrands.isError} isLoading={topBrands.isPending} items={topBrands.data ?? []} offLabel={t("off")} onRetry={() => void topBrands.refetch()} retryLabel={t("retry")} seeAllHref="/discovery/all/top-brands" seeAllLabel={t("seeAll")} stores={nearby.data ?? []} description={t("topBrandsDescription")} title={t("topBrandsTitle")} />;
          }
          if (section.kind === "nearby-stores") {
            return <StoreRailSection key={section.key} emptyMessage={t("nearbyEmpty")} emptyTitle={t("emptyTitle")} errorMessage={t("errorMessage")} errorTitle={t("errorTitle")} hasLocation={isLocationReady ? Boolean(location) : true} isError={nearby.isError} isLoading={!isLocationReady || nearby.isPending} items={nearby.data ?? []} locationMessage={t("chooseLocation")} onRetry={() => void nearby.refetch()} retryLabel={t("retry")} seeAllHref="/discovery/all/nearby" seeAllLabel={t("seeAll")} description={t("nearbyDescription")} title={t("nearbyTitle")} />;
          }
          if (section.kind === "deals") {
            return <StoreRailSection key={section.key} emptyMessage={t("emptyMessage")} emptyTitle={t("emptyTitle")} errorMessage={t("errorMessage")} errorTitle={t("errorTitle")} isError={deals.isError} isLoading={deals.isPending} items={deals.data ?? []} onRetry={() => void deals.refetch()} retryLabel={t("retry")} seeAllHref="/discovery/all/deals" seeAllLabel={t("seeAll")} description={t("dealsDescription")} title={t("dealsTitle")} />;
          }
          if (section.kind === "order-again") {
            return <OrderAgainSection key={section.key} items={isAuthenticated ? orderAgain.data ?? [] : []} seeAllHref="/discovery/all/order-again" seeAllLabel={t("seeAll")} />;
          }
          if (section.kind === "shop-type-stores") {
            const shopTypeId = section.key.slice("shop-type:".length);
            const query = rowQueries[rows.findIndex((row) => row.key === section.key)];
            return <StoreRailSection key={section.key} emptyMessage={t("shopTypeStoresEmpty")} emptyTitle={t("emptyTitle")} errorMessage={t("errorMessage")} errorTitle={t("errorTitle")} id={`shop-type-${shopTypeId}`} isError={query?.isError ?? false} isLoading={query?.isPending ?? true} items={query?.data ?? []} onRetry={() => void query?.refetch()} retryLabel={t("retry")} seeAllHref={`/discovery/all/stores?shopTypeId=${encodeURIComponent(shopTypeId)}&title=${encodeURIComponent(decodeDisplayText(section.title))}`} seeAllLabel={t("seeAll")} title={decodeDisplayText(section.title)} />;
          }
          return null;
        })}
      </div>
    </main>
    <Footer />
  </>;
}

export function DiscoveryPageSkeleton() {
  return <><Header /><main className="pb-16" aria-busy="true"><div className="app-wrap space-y-6 py-8">{Array.from({ length: 4 }, (_, index) => <div key={index} className="space-y-4"><div className="h-7 w-44 animate-pulse rounded-lg bg-[var(--soft-surface)]" /><RailSkeleton /></div>)}</div></main></>;
}
