import { cn } from "@/lib/utils";
import {
  Rail,
  RailSkeleton,
  SectionHeading,
  SectionState,
} from "@/modules/deliveries/components/discovery/DiscoverySection";
import { DealCard } from "@/modules/deliveries/components/discovery/DealCard";
import { DealPercentBadge } from "@/modules/deliveries/components/discovery/DealPercentBadge";
import { DealCardSkeleton } from "@/modules/deliveries/components/discovery/skeletons/DealCardSkeleton";
import { StoreCard } from "@/modules/deliveries/components/discovery/StoreCard";
import type { DeliveryStore } from "@/modules/deliveries/types/discovery";
import styles from "./discovery-cards.module.css";

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
  /** `deal` renders a scrollable row of offer cards on a highlighted panel. */
  variant?: "store" | "deal";
}

const DEAL_SLOT = "w-60 shrink-0 snap-start sm:w-[23rem] lg:w-[26rem]";

export function StoreRailSection(props: Props) {
  // Hide the whole section rather than showing an empty placeholder.
  if (props.hasLocation !== false && !props.isLoading && !props.isError && props.items.length === 0) return null;
  const isDeal = props.variant === "deal";
  const showSeeAll = props.hasLocation !== false && !props.isLoading && !props.isError && props.items.length > 0;
  const body =
    props.hasLocation === false ? (
      <SectionState
        title={props.emptyTitle}
        message={props.locationMessage ?? props.emptyMessage}
        tone="location"
      />
    ) : props.isLoading ? (
      isDeal ? (
        <div aria-hidden="true" className="flex gap-3 overflow-hidden pb-6 pt-3 sm:gap-4">
          {[0, 1, 2].map((index) => (
            <div className={DEAL_SLOT} key={index}>
              <DealCardSkeleton />
            </div>
          ))}
        </div>
      ) : (
        <RailSkeleton />
      )
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
        {isDeal
          ? props.items.map((store, index) => (
              <div
                className={cn(styles.cardEnter, DEAL_SLOT)}
                key={`${store.storeId}:${store.deal ?? ""}:${index}`}
                style={{ "--enter-delay": `${Math.min(index, 5) * 70}ms` } as React.CSSProperties}
              >
                <DealCard store={store} />
              </div>
            ))
          : props.items.map((store) => (
              <StoreCard key={store.storeId} store={store} />
            ))}
      </Rail>
    );

  return (
    <section className="scroll-mt-28 space-y-4" id={props.id}>
      <SectionHeading
        actionHref={showSeeAll ? props.seeAllHref : undefined}
        actionLabel={props.seeAllLabel}
        isActionPending={props.isLoading && props.hasLocation !== false && Boolean(props.seeAllHref)}
        title={props.title}
        description={props.description}
      />
      {isDeal ? (
        <div className="relative -mx-4 mt-6 sm:mx-0 sm:mt-8">
          <DealPercentBadge />
          {/* Top padding keeps the cards clear of the corner tile. */}
          <div className="overflow-hidden bg-[linear-gradient(180deg,color-mix(in_srgb,var(--color-brand)_16%,var(--color-surface)),color-mix(in_srgb,var(--color-brand)_10%,var(--color-surface)))] px-5 pt-5 shadow-[0_24px_50px_color-mix(in_srgb,var(--color-brand)_16%,transparent),inset_0_0_0_1px_rgb(255_255_255/0.6),inset_0_2px_12px_rgb(255_255_255/0.5)] sm:rounded-[2rem] sm:px-7 sm:pt-6 dark:shadow-none dark:ring-1 dark:ring-brand/20">
            {body}
          </div>
        </div>
      ) : (
        body
      )}
    </section>
  );
}
