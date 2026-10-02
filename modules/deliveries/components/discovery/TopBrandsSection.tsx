import Link from "next/link";
import {
  Rail,
  RailSkeleton,
  SectionHeading,
  SectionState,
} from "@/modules/deliveries/components/discovery/DiscoverySection";
import type {
  DeliveryStore,
  DeliveryTopBrand,
} from "@/modules/deliveries/types/discovery";
import { TopBrandCard } from "./TopBrandCard";

function matchedStore(brand: DeliveryTopBrand, stores: DeliveryStore[]) {
  const name = brand.name.trim().toLowerCase();
  return (
    stores.find((store) => store.name.trim().toLowerCase() === name) ??
    stores.find((store) => store.name.trim().toLowerCase().includes(name))
  );
}

interface Props {
  items: DeliveryTopBrand[];
  stores: DeliveryStore[];
  isLoading: boolean;
  isError: boolean;
  title: string;
  description: string;
  errorTitle: string;
  errorMessage: string;
  offLabel: string;
  retryLabel: string;
  onRetry: () => void;
  seeAllHref?: string;
  seeAllLabel?: string;
}

export function TopBrandsSection(props: Props) {
  // Hide the whole section rather than showing an empty placeholder.
  if (!props.isLoading && !props.isError && props.items.length === 0) return null;
  const showSeeAll = !props.isLoading && !props.isError && props.items.length > 0;
  return (
    <section className="space-y-4">
      <SectionHeading
        actionHref={showSeeAll ? props.seeAllHref : undefined}
        actionLabel={props.seeAllLabel}
        isActionPending={props.isLoading && Boolean(props.seeAllHref)}
        title={props.title}
        description={props.description}
      />
      {props.isLoading ? (
        <RailSkeleton card="brand" />
      ) : props.isError ? (
        <SectionState
          actionLabel={props.retryLabel}
          message={props.errorMessage}
          onAction={props.onRetry}
          title={props.errorTitle}
          tone="error"
        />
      ) : (
        <Rail>
          {props.items.map((brand) => {
            const store = brand.storeId ? { storeId: brand.storeId } : matchedStore(brand, props.stores);
            const content = <TopBrandCard brand={brand} offLabel={props.offLabel} />;
            return store ? (
              <Link
                className="group rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-brand"
                href={`/restaurants/${encodeURIComponent(("slug" in store ? store.slug : brand.slug) || store.storeId)}`}
                key={`${brand.vendorId ?? brand.name}-${brand.name}`}
              >
                {content}
              </Link>
            ) : (
              <div key={`${brand.vendorId ?? brand.name}-${brand.name}`}>
                {content}
              </div>
            );
          })}
        </Rail>
      )}
    </section>
  );
}
