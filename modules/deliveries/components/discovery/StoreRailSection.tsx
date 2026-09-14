import {
  Rail,
  RailSkeleton,
  SectionHeading,
  SectionState,
} from "@/modules/deliveries/components/discovery/DiscoverySection";
import { StoreCard } from "@/modules/deliveries/components/discovery/StoreCard";
import type { DeliveryStore } from "@/modules/deliveries/types/discovery";

interface Props {
  id?: string;
  items: DeliveryStore[];
  isLoading: boolean;
  isError: boolean;
  title: string;
  description?: string;
  emptyTitle: string;
  emptyMessage: string;
  errorTitle: string;
  errorMessage: string;
  locationMessage?: string;
  hasLocation?: boolean;
  retryLabel: string;
  onRetry: () => void;
  seeAllHref?: string;
  seeAllLabel?: string;
}

export function StoreRailSection(props: Props) {
  const showSeeAll = props.hasLocation !== false && !props.isLoading && !props.isError && props.items.length > 0;
  return (
    <section className="scroll-mt-28 space-y-4" id={props.id}>
      <SectionHeading
        actionHref={showSeeAll ? props.seeAllHref : undefined}
        actionLabel={showSeeAll ? props.seeAllLabel : undefined}
        title={props.title}
        description={props.description}
      />
      {props.hasLocation === false ? (
        <SectionState
          title={props.emptyTitle}
          message={props.locationMessage ?? props.emptyMessage}
          tone="location"
        />
      ) : props.isLoading ? (
        <RailSkeleton />
      ) : props.isError ? (
        <SectionState
          actionLabel={props.retryLabel}
          message={props.errorMessage}
          onAction={props.onRetry}
          title={props.errorTitle}
          tone="error"
        />
      ) : props.items.length === 0 ? (
        <SectionState title={props.emptyTitle} message={props.emptyMessage} />
      ) : (
        <Rail>
          {props.items.map((store) => (
            <StoreCard key={store.storeId} store={store} />
          ))}
        </Rail>
      )}
    </section>
  );
}
