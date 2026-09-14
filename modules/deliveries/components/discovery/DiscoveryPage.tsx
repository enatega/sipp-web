"use client";

import { useTranslations } from "next-intl";
import { Footer } from "@/components/shared/app-shell/Footer";
import { Header } from "@/components/shared/app-shell/Header";
import { useSessionQuery } from "@/modules/account";
import { OffersCarousel } from "@/modules/deliveries/components/discovery/OffersCarousel";
import { OrderAgainSection } from "@/modules/deliveries/components/discovery/OrderAgainSection";
import {
  RailSkeleton,
} from "@/modules/deliveries/components/discovery/DiscoverySection";
import { ShopTypesSection } from "@/modules/deliveries/components/discovery/ShopTypesSection";
import { StoreRailSection } from "@/modules/deliveries/components/discovery/StoreRailSection";
import { TopBrandsSection } from "@/modules/deliveries/components/discovery/TopBrandsSection";
import {
  useBannersQuery,
  useDealsQuery,
  useDiscoveryLocation,
  useNearbyStoresQuery,
  useOrderAgainQuery,
  useShopTypeStoreQueries,
  useShopTypesQuery,
  useTopBrandsQuery,
} from "@/modules/deliveries/hooks/useDiscoveryQueries";
import { decodeDisplayText } from "@/modules/deliveries/utils/discoveryMappers";

export function DiscoveryPage() {
  const t = useTranslations("deliveries.discovery");
  const session = useSessionQuery();
  const isAuthenticated = session.data?.authenticated === true;
  const { location, isLocationReady } = useDiscoveryLocation(isAuthenticated);
  const shopTypes = useShopTypesQuery(true);
  const banners = useBannersQuery(true);
  const topBrands = useTopBrandsQuery(location, true);
  const nearbyStores = useNearbyStoresQuery(location, true);
  const deals = useDealsQuery(true);
  const orderAgain = useOrderAgainQuery(isAuthenticated);
  const shopTypeItems = shopTypes.data ?? [];
  const shopTypeStoreQueries = useShopTypeStoreQueries(
    shopTypeItems,
    location,
    true,
  );

  if (session.isPending) return <DiscoveryPageSkeleton />;

  return (
    <>
      <Header />
      <main className="bg-[linear-gradient(180deg,var(--soft-surface)_0,transparent_520px)] pb-16 sm:pb-20">
        <h1 className="sr-only">{t("pageTitle")}</h1>
        <div className="section-wrap space-y-10 py-5 sm:space-y-12 sm:py-8 lg:space-y-14">
          {banners.isPending ? (
            <div className="h-[290px] w-full animate-pulse rounded-2xl bg-[var(--soft-surface)] sm:h-[380px] lg:h-[430px]" />
          ) : (
            <OffersCarousel
              ctaLabel={t("exploreOffer")}
              items={banners.data ?? []}
              label={t("specialOffers")}
              nextLabel={t("nextOffer")}
              positionLabel={(position) => t("offerPosition", { position })}
              previousLabel={t("previousOffer")}
            />
          )}

          <div className="rounded-3xl bg-[var(--soft-surface)] px-4 py-6 sm:px-6 sm:py-7">
            <ShopTypesSection
              emptyMessage={t("shopTypesEmpty")}
              emptyTitle={t("emptyTitle")}
              errorMessage={t("errorMessage")}
              errorTitle={t("errorTitle")}
              isError={shopTypes.isError}
              isLoading={shopTypes.isPending}
              items={shopTypeItems}
              onRetry={() => void shopTypes.refetch()}
              retryLabel={t("retry")}
              seeAllHref="/discovery/all/shop-types"
              seeAllLabel={t("seeAll")}
              description={t("shopTypesDescription")}
              title={t("shopTypesTitle")}
            />
          </div>

          <StoreRailSection
            emptyMessage={t("nearbyEmpty")}
            emptyTitle={t("emptyTitle")}
            errorMessage={t("errorMessage")}
            errorTitle={t("errorTitle")}
            hasLocation={isLocationReady ? Boolean(location) : true}
            isError={nearbyStores.isError}
            isLoading={!isLocationReady || nearbyStores.isPending}
            items={nearbyStores.data ?? []}
            locationMessage={t("chooseLocation")}
            onRetry={() => void nearbyStores.refetch()}
            retryLabel={t("retry")}
            seeAllHref="/discovery/all/nearby"
            seeAllLabel={t("seeAll")}
            description={t("nearbyDescription")}
            title={t("nearbyTitle")}
          />

          <TopBrandsSection
            emptyMessage={t("emptyMessage")}
            emptyTitle={t("emptyTitle")}
            errorMessage={t("errorMessage")}
            errorTitle={t("errorTitle")}
            isError={topBrands.isError}
            isLoading={topBrands.isPending}
            items={topBrands.data ?? []}
            offLabel={t("off")}
            onRetry={() => void topBrands.refetch()}
            retryLabel={t("retry")}
            seeAllHref="/discovery/all/top-brands"
            seeAllLabel={t("seeAll")}
            stores={nearbyStores.data ?? []}
            description={t("topBrandsDescription")}
            title={t("topBrandsTitle")}
          />

          {isAuthenticated ? (
            <OrderAgainSection
              isError={orderAgain.isError}
              isLoading={orderAgain.isPending}
              items={orderAgain.data ?? []}
              onRetry={() => void orderAgain.refetch()}
              seeAllHref="/discovery/all/order-again"
              seeAllLabel={t("seeAll")}
            />
          ) : null}

          <StoreRailSection
            emptyMessage={t("emptyMessage")}
            emptyTitle={t("emptyTitle")}
            errorMessage={t("errorMessage")}
            errorTitle={t("errorTitle")}
            isError={deals.isError}
            isLoading={deals.isPending}
            items={deals.data ?? []}
            onRetry={() => void deals.refetch()}
            retryLabel={t("retry")}
            seeAllHref="/discovery/all/deals"
            seeAllLabel={t("seeAll")}
            description={t("dealsDescription")}
            title={t("dealsTitle")}
          />

          {shopTypeItems.map((shopType, index) => {
            const query = shopTypeStoreQueries[index];
            return (
              <StoreRailSection
                emptyMessage={t("shopTypeStoresEmpty")}
                emptyTitle={t("emptyTitle")}
                errorMessage={t("errorMessage")}
                errorTitle={t("errorTitle")}
                id={`shop-type-${shopType.id}`}
                isError={query?.isError ?? false}
                isLoading={query?.isPending ?? true}
                items={query?.data ?? []}
                key={shopType.id}
                onRetry={() => void query?.refetch()}
                retryLabel={t("retry")}
                seeAllHref={`/discovery/all/stores?shopTypeId=${encodeURIComponent(shopType.id)}&title=${encodeURIComponent(decodeDisplayText(shopType.name))}`}
                seeAllLabel={t("seeAll")}
                title={decodeDisplayText(shopType.name)}
              />
            );
          })}

        </div>
      </main>
      <Footer />
    </>
  );
}

export function DiscoveryPageSkeleton() {
  return (
    <>
      <Header />
      <main className="bg-[linear-gradient(180deg,var(--soft-surface)_0,transparent_520px)] pb-16 sm:pb-20" aria-busy="true">
        <div className="section-wrap space-y-10 py-5 sm:space-y-12 sm:py-8 lg:space-y-14">
          <div className="h-[290px] w-full animate-pulse rounded-2xl bg-[var(--soft-surface)] sm:h-[380px] lg:h-[430px]" />
          <div className="space-y-5">
            <div className="h-7 w-36 animate-pulse rounded-lg bg-[var(--soft-surface)]" />
            <RailSkeleton compact />
          </div>
          {Array.from({ length: 3 }, (_, index) => (
            <div className="space-y-5" key={index}>
              <div className="h-7 w-44 animate-pulse rounded-lg bg-[var(--soft-surface)]" />
              <RailSkeleton />
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
