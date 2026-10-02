"use client";

import { useTranslations } from "next-intl";
import { ShopTypesSection } from "@/modules/deliveries/components/discovery/ShopTypesSection";
import { useShopTypesQuery } from "@/modules/deliveries/hooks/useDiscoveryQueries";
import { decodeDisplayText } from "@/modules/deliveries/utils/discoveryMappers";
import type { DeliveryShopType } from "@/modules/deliveries/types/discovery";

function storesHref(item: DeliveryShopType) {
  return `/discovery/all/stores?shopTypeId=${encodeURIComponent(item.id)}&title=${encodeURIComponent(decodeDisplayText(item.name))}`;
}

/** Scrollable shop type strip for the marketing landing page; links straight to filtered shops. */
export function LandingShopTypesSection() {
  const t = useTranslations("deliveries.discovery");
  const shopTypes = useShopTypesQuery(true);
  const items = shopTypes.data ?? [];

  return (
    <div className="section-wrap my-12">
      <ShopTypesSection
        errorMessage={t("errorMessage")}
        errorTitle={t("errorTitle")}
        getItemHref={storesHref}
        isError={shopTypes.isError}
        isLoading={shopTypes.isPending}
        items={items}
        onRetry={() => void shopTypes.refetch()}
        retryLabel={t("retry")}
        seeAllHref="/discovery/all/shop-types"
        seeAllLabel={t("seeAll")}
        description={t("shopTypesDescription")}
        title={t("shopTypesTitle")}
      />
    </div>
  );
}
