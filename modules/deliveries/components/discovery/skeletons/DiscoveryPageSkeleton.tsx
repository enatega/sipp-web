"use client";

import { useTranslations } from "next-intl";
import { Header } from "@/components/shared/app-shell/Header";
import { QuickActionsNav } from "../QuickActionsNav";
import { RailSkeleton } from "../DiscoverySection";
import { ShopTypesSection } from "../ShopTypesSection";
import { StoreRailSection } from "../StoreRailSection";
import { TopBrandsSection } from "../TopBrandsSection";
import { BannerSkeleton } from "./BannerSkeleton";
import { SectionHeadingSkeleton } from "./SectionHeadingSkeleton";

function noop() {}

/**
 * Renders the discovery page's default section order in its loading state, so
 * every placeholder sits exactly where the loaded content will appear.
 */
export function DiscoveryPageSkeleton() {
  const t = useTranslations("deliveries.discovery");
  const states = {
    emptyMessage: "",
    emptyTitle: "",
    errorMessage: "",
    errorTitle: "",
    isError: false,
    isLoading: true,
    items: [],
    onRetry: noop,
    retryLabel: "",
    seeAllLabel: t("seeAll"),
  };

  return (
    <>
      <Header />
      <main
        aria-busy="true"
        className="bg-[linear-gradient(180deg,var(--soft-surface)_0,transparent_520px)] pb-16 sm:pb-20"
      >
        <h1 className="sr-only">{t("pageTitle")}</h1>
        <div className="app-wrap space-y-7 py-4 sm:space-y-8 sm:py-6 lg:space-y-10">
          <BannerSkeleton />
          <ShopTypesSection
            {...states}
            description={t("shopTypesDescription")}
            seeAllHref="/discovery/all/shop-types"
            title={t("shopTypesTitle")}
          />
          <QuickActionsNav />
          <TopBrandsSection
            {...states}
            description={t("topBrandsDescription")}
            seeAllHref="/discovery/all/top-brands"
            offLabel=""
            stores={[]}
            title={t("topBrandsTitle")}
          />
          <StoreRailSection
            {...states}
            description={t("nearbyDescription")}
            seeAllHref="/discovery/all/nearby"
            title={t("nearbyTitle")}
          />
          <StoreRailSection
            {...states}
            description={t("dealsDescription")}
            seeAllHref="/discovery/all/deals"
            title={t("dealsTitle")}
            variant="deal"
          />
          <section aria-hidden="true" className="space-y-4">
            <SectionHeadingSkeleton />
            <RailSkeleton />
          </section>
        </div>
      </main>
    </>
  );
}
