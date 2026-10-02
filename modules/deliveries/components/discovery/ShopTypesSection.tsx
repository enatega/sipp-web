import {
  SectionHeading,
  SectionState,
} from "@/modules/deliveries/components/discovery/DiscoverySection";
import { ShopTypesSkeleton } from "@/modules/deliveries/components/discovery/skeletons/ShopTypesSkeleton";
import { ShopTypeCarousel } from "@/modules/deliveries/components/discovery/ShopTypeCarousel";
import type { DeliveryShopType } from "@/modules/deliveries/types/discovery";

interface Props {
  items: DeliveryShopType[];
  isLoading: boolean;
  isError: boolean;
  title: string;
  description: string;
  errorTitle: string;
  errorMessage: string;
  retryLabel: string;
  onRetry: () => void;
  seeAllHref?: string;
  seeAllLabel?: string;
  /** Overrides the default in-page anchor link for each card. */
  getItemHref?: (item: DeliveryShopType) => string;
}

function defaultItemHref(item: DeliveryShopType) {
  return `#shop-type-${item.id}`;
}

export function ShopTypesSection(props: Props) {
  // Hide the whole section rather than showing an empty placeholder.
  if (!props.isLoading && !props.isError && props.items.length === 0) return null;
  const showSeeAll = !props.isLoading && !props.isError && props.items.length > 0;
  const getItemHref = props.getItemHref ?? defaultItemHref;
  return (
    <section className="space-y-4" aria-labelledby="shop-types-title">
      <div id="shop-types-title">
        <SectionHeading
          actionHref={showSeeAll ? props.seeAllHref : undefined}
          actionLabel={props.seeAllLabel}
          isActionPending={props.isLoading && Boolean(props.seeAllHref)}
          title={props.title}
          description={props.description}
        />
      </div>
      {props.isLoading ? (
        <ShopTypesSkeleton />
      ) : props.isError ? (
        <SectionState
          actionLabel={props.retryLabel}
          message={props.errorMessage}
          onAction={props.onRetry}
          title={props.errorTitle}
          tone="error"
        />
      ) : (
        <ShopTypeCarousel getItemHref={getItemHref} items={props.items} />
      )}
    </section>
  );
}
