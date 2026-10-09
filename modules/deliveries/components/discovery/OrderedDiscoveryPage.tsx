"use client";

import { useTranslations } from "next-intl";
import { Header } from "@/components/shared/app-shell/Header";
import { Footer } from "@/components/shared/app-shell/Footer";
import { useSessionQuery } from "@/modules/account";
import { FeatureHighlights } from "./FeatureHighlights";
import { FavouriteFoodsCarousel } from "./FavouriteFoodsCarousel";
import { OffersCarousel } from "./OffersCarousel";
import { OrderAgainSection } from "./OrderAgainSection";
import { QuickActionsNav } from "./QuickActionsNav";
import { ShopTypesSection } from "./ShopTypesSection";
import { StoreRailSection } from "./StoreRailSection";
import { TopBrandsSection } from "./TopBrandsSection";
import { SectionHeading, SectionState } from "./DiscoverySection";
import { BannerSkeleton } from "./skeletons/BannerSkeleton";
import { DiscoveryPageSkeleton } from "./skeletons/DiscoveryPageSkeleton";
import {
  useBannersQuery, useDealsQuery, useDiscoveryLocation, useHomeLayoutQuery,
  useNearbyStoresQuery, useOrderAgainQuery, useShopTypeStoreQueries,
  useShopTypesQuery, useTopBrandsQuery,
} from "@/modules/deliveries/hooks/useDiscoveryQueries";
import { decodeDisplayText } from "@/modules/deliveries/utils/discoveryMappers";

/** Banners and shop types lead the configured section order. */
const PINNED_SECTION_KINDS = ["banners", "shop-types"];

function pinLeadSections<T extends { kind: string }>(sections: T[]) {
  const pinned = PINNED_SECTION_KINDS.flatMap((kind) =>
    sections.filter((section) => section.kind === kind),
  );
  return [
    ...pinned,
    ...sections.filter((section) => !PINNED_SECTION_KINDS.includes(section.kind)),
  ];
}

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
  const homeSections = pinLeadSections(layout.data?.sections ?? [
    { key: 'shop-types', kind: 'shop-types', title: '' },
    { key: 'banners', kind: 'banners', title: '' },
    { key: 'quick-actions', kind: 'quick-actions', title: '' },
    { key: 'top-brands', kind: 'top-brands', title: '' },
    { key: 'nearby-stores', kind: 'nearby-stores', title: '' },
    { key: 'deals', kind: 'deals', title: '' },
    ...(shopTypes.data?.items ?? []).map((type) => ({ key: `shop-type:${type.id}`, kind: 'shop-type-stores', title: type.name })),
    { key: 'order-again', kind: 'order-again', title: '' },
  ]);
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
      <div className="app-wrap space-y-7 py-4 sm:space-y-8 sm:py-6">
        {homeSections.map((section) => {
          if (section.kind === "banners") {
            return banners.isPending
              ? <BannerSkeleton key={section.key} />
              : banners.isError
                ? <section key={section.key} className="space-y-4"><SectionHeading title={t("specialOffers")} /><SectionState title={t("errorTitle")} message={t("errorMessage")} tone="error" actionLabel={t("retry")} onAction={() => void banners.refetch()} /></section>
              : banners.data?.length
                ? <OffersCarousel key={section.key} ctaLabel={t("exploreOffer")} items={banners.data} label={t("specialOffers")} nextLabel={t("nextOffer")} positionLabel={(position) => t("offerPosition", { position })} />
                : null;
          }
          if (section.kind === "shop-types") {
            return <div className="space-y-6 sm:space-y-8" key={section.key}>
              <ShopTypesSection errorMessage={t("errorMessage")} errorTitle={t("errorTitle")} isError={shopTypes.isError} isLoading={shopTypes.isPending} items={shopTypes.data?.items ?? []} totalItems={shopTypes.data?.total} onRetry={() => void shopTypes.refetch()} retryLabel={t("retry")} seeAllHref="/discovery/all/shop-types" seeAllLabel={t("seeAll")} description={t("shopTypesDescription")} title={t("shopTypesTitle")} />
              <FavouriteFoodsCarousel />
            </div>;
          }
          if (section.kind === "quick-actions") {
            return <QuickActionsNav key={section.key} />;
          }
          if (section.kind === "top-brands") {
            return <TopBrandsSection key={section.key} errorMessage={t("errorMessage")} errorTitle={t("errorTitle")} isError={topBrands.isError} isLoading={topBrands.isPending} items={topBrands.data ?? []} offLabel={t("off")} onRetry={() => void topBrands.refetch()} retryLabel={t("retry")} seeAllHref="/discovery/all/top-brands" seeAllLabel={t("seeAll")} stores={nearby.data ?? []} description={t("topBrandsDescription")} title={t("topBrandsTitle")} />;
          }
          if (section.kind === "nearby-stores") {
            return <StoreRailSection key={section.key} emptyMessage={t("nearbyEmpty")} emptyTitle={t("emptyTitle")} errorMessage={t("errorMessage")} errorTitle={t("errorTitle")} hasLocation={isLocationReady ? Boolean(location) : true} isError={nearby.isError} isLoading={!isLocationReady || nearby.isPending} items={nearby.data ?? []} locationMessage={t("chooseLocation")} onRetry={() => void nearby.refetch()} retryLabel={t("retry")} seeAllHref="/discovery/all/nearby" seeAllLabel={t("seeAll")} description={t("nearbyDescription")} title={t("nearbyTitle")} />;
          }
          if (section.kind === "deals") {
            return <StoreRailSection key={section.key} emptyMessage={t("emptyMessage")} emptyTitle={t("emptyTitle")} errorMessage={t("errorMessage")} errorTitle={t("errorTitle")} isError={deals.isError} isLoading={deals.isPending} items={deals.data ?? []} onRetry={() => void deals.refetch()} retryLabel={t("retry")} seeAllHref="/discovery/all/deals" seeAllLabel={t("seeAll")} description={t("dealsDescription")} title={t("dealsTitle")} variant="deal" />;
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
        <FeatureHighlights />
      </div>
    </main>
    <Footer />
  </>;
}
