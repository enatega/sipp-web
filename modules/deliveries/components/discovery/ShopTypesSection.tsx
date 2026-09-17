import Link from "next/link";
import { DeliveryImage } from "@/modules/deliveries/components/discovery/DeliveryImage";
import {
  Rail,
  RailSkeleton,
  SectionHeading,
  SectionState,
} from "@/modules/deliveries/components/discovery/DiscoverySection";
import type { DeliveryShopType } from "@/modules/deliveries/types/discovery";
import { decodeDisplayText } from "@/modules/deliveries/utils/discoveryMappers";

interface Props {
  items: DeliveryShopType[];
  isLoading: boolean;
  isError: boolean;
  title: string;
  description: string;
  emptyTitle: string;
  emptyMessage: string;
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
  const showSeeAll = !props.isLoading && !props.isError && props.items.length > 0;
  const getItemHref = props.getItemHref ?? defaultItemHref;
  return (
    <section className="space-y-4" aria-labelledby="shop-types-title">
      <div id="shop-types-title">
        <SectionHeading
          actionHref={showSeeAll ? props.seeAllHref : undefined}
          actionLabel={showSeeAll ? props.seeAllLabel : undefined}
          title={props.title}
          description={props.description}
        />
      </div>
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
          {props.items.map((item) => (
            <Link
              className="group w-40 shrink-0 snap-start focus-visible:rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-brand sm:w-44"
              href={getItemHref(item)}
              key={item.id}
            >
              <article className="overflow-hidden rounded-2xl bg-card shadow-sm transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-md">
                <DeliveryImage
                  alt=""
                  className="aspect-[4/3] w-full"
                  imageClassName="transition-transform duration-500 ease-out group-hover:scale-105"
                  sizes="176px"
                  src={item.image ?? item.icon}
                />
                <div className="flex min-h-16 items-start px-3.5 py-3">
                  <h3 className="text-sm font-bold leading-5 text-ink [overflow-wrap:anywhere]">
                    {decodeDisplayText(item.name)}
                  </h3>
                </div>
              </article>
            </Link>
          ))}
        </Rail>
      )}
    </section>
  );
}
