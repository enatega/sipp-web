import Link from "next/link";
import { Tag } from "lucide-react";
import { DeliveryImage } from "@/modules/deliveries/components/discovery/DeliveryImage";
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
  emptyTitle: string;
  emptyMessage: string;
  errorTitle: string;
  errorMessage: string;
  offLabel: string;
  retryLabel: string;
  onRetry: () => void;
  seeAllHref?: string;
  seeAllLabel?: string;
}

export function TopBrandsSection(props: Props) {
  const showSeeAll = !props.isLoading && !props.isError && props.items.length > 0;
  return (
    <section className="space-y-4">
      <SectionHeading
        actionHref={showSeeAll ? props.seeAllHref : undefined}
        actionLabel={showSeeAll ? props.seeAllLabel : undefined}
        title={props.title}
        description={props.description}
      />
      {props.isLoading ? (
        <RailSkeleton compact />
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
          {props.items.map((brand) => {
            const store = matchedStore(brand, props.stores);
            const content = (
              <article className="group w-40 shrink-0 snap-start overflow-hidden rounded-2xl bg-card shadow-sm transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-md sm:w-44">
                <DeliveryImage
                  alt={brand.name}
                  className="aspect-[4/3] w-full"
                  imageClassName="transition-transform duration-500 ease-out group-hover:scale-105"
                  sizes="176px"
                  src={brand.logo}
                />
                <div className="min-h-[4.75rem] px-3.5 py-3">
                  <h3 className="text-sm font-bold leading-5 text-ink [overflow-wrap:anywhere]">
                    {brand.name}
                  </h3>
                  {brand.dealAmount || brand.deal ? (
                    <p className="mt-1.5 flex items-start gap-1 text-[10px] font-semibold leading-4 text-brand">
                      <Tag aria-hidden="true" className="size-3" />
                      {brand.dealAmount
                        ? `${brand.dealAmount}${brand.dealType === "percentage" ? "%" : ""} ${props.offLabel}`
                        : brand.deal}
                    </p>
                  ) : null}
                </div>
              </article>
            );
            return store ? (
              <Link
                className="focus-visible:rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-brand"
                href={`/restaurants/${encodeURIComponent(store.storeId)}`}
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
