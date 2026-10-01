import { cn } from "@/lib/utils";
import {
  Rail,
  RailSkeleton,
  SectionHeading,
  SectionState,
} from "@/modules/deliveries/components/discovery/DiscoverySection";
import { DealCard } from "@/modules/deliveries/components/discovery/DealCard";
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
  /** `deal` renders compact offer cards on a highlighted panel. */
  variant?: "store" | "deal";
}

export function StoreRailSection(props: Props) {
  const isDeal = props.variant === "deal";
  const showSeeAll = props.hasLocation !== false && !props.isLoading && !props.isError && props.items.length > 0;
  return (
    <section
      className={cn(
        "scroll-mt-28 space-y-4",
        isDeal &&
          "-mx-4 overflow-hidden bg-[radial-gradient(ellipse_at_100%_0%,color-mix(in_srgb,var(--color-brand)_22%,transparent),transparent_60%)] bg-brand/5 px-4 py-6 ring-1 ring-brand/15 sm:mx-0 sm:rounded-3xl sm:px-7 sm:py-7",
      )}
      id={props.id}
    >
      <SectionHeading
        actionHref={showSeeAll ? props.seeAllHref : undefined}
        actionLabel={props.seeAllLabel}
        isActionPending={props.isLoading && props.hasLocation !== false && Boolean(props.seeAllHref)}
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
        isDeal ? (
          <div aria-hidden="true" className="grid gap-3 sm:gap-4 md:grid-cols-2">
            <DealCardSkeleton layout="wide" />
            <DealCardSkeleton layout="wide" />
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
      ) : props.items.length === 0 ? (
        <SectionState title={props.emptyTitle} message={props.emptyMessage} />
      ) : isDeal && props.items.length <= 2 ? (
        <div
          className={cn(
            "grid gap-3 sm:gap-4",
            props.items.length === 2 && "md:grid-cols-2",
          )}
        >
          {props.items.map((store, index) => (
            <div
              className={styles.cardEnter}
              key={`${store.storeId}:${store.deal ?? ""}:${index}`}
              style={{ "--enter-delay": `${index * 90}ms` } as React.CSSProperties}
            >
              <DealCard layout="wide" store={store} />
            </div>
          ))}
        </div>
      ) : (
        <Rail>
          {isDeal
            ? props.items.map((store, index) => (
                <div
                  className={cn(styles.cardEnter, "shrink-0 snap-start")}
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
      )}
    </section>
  );
}
