import Link from "next/link";
import { useFormatter, useTranslations } from "next-intl";
import { useAppCurrencyFormatter } from "@/lib/useAppCurrency";
import { DeliveryImage } from "@/modules/deliveries/components/discovery/DeliveryImage";
import {
  Rail,
  RailSkeleton,
  SectionHeading,
  SectionState,
} from "@/modules/deliveries/components/discovery/DiscoverySection";
import type { DeliveryOrderAgainOrder } from "@/modules/deliveries/types/discovery";

interface Props {
  items: DeliveryOrderAgainOrder[];
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  seeAllHref?: string;
  seeAllLabel?: string;
}

export function OrderAgainSection({ items, isLoading, isError, onRetry, seeAllHref, seeAllLabel }: Props) {
  const t = useTranslations("deliveries.discovery");
  const format = useFormatter();
  const formatAppCurrency = useAppCurrencyFormatter();
  return (
    <section className="space-y-4">
      <SectionHeading
        actionHref={!isLoading && !isError && items.length > 0 ? seeAllHref : undefined}
        actionLabel={!isLoading && !isError && items.length > 0 ? seeAllLabel : undefined}
        title={t("orderAgainTitle")}
        description={t("orderAgainDescription")}
      />
      {isLoading ? (
        <RailSkeleton />
      ) : isError ? (
        <SectionState
          actionLabel={t("retry")}
          message={t("errorMessage")}
          onAction={onRetry}
          title={t("errorTitle")}
          tone="error"
        />
      ) : items.length === 0 ? (
        <SectionState title={t("emptyTitle")} message={t("orderAgainEmpty")} />
      ) : (
        <Rail>
          {items.map((order) => (
            <Link
              className="group w-[252px] shrink-0 snap-start overflow-hidden rounded-2xl bg-card shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-brand sm:w-[300px]"
              href={`/orders/${encodeURIComponent(order.orderId)}`}
              key={order.orderId}
            >
              <DeliveryImage
                alt=""
                className="aspect-[16/9] w-full"
                imageClassName="transition-transform duration-500 ease-out group-hover:scale-105"
                sizes="(max-width: 640px) 270px, 310px"
                src={
                  order.itemImages.find(Boolean) ??
                  order.storeImage ??
                  order.storeLogo
                }
              />
              <div className="p-3.5 sm:p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate font-heading text-sm font-bold text-ink">{order.storeName}</h3>
                    <p className="mt-1 truncate text-xs text-muted">
                      {order.itemNames.join(", ")}
                    </p>
                  </div>
                  <b className="shrink-0 text-xs text-brand">
                    {formatAppCurrency(format, order.orderTotal)}
                  </b>
                </div>
                <p className="mt-3 text-[10px] font-medium text-muted">
                  {t("orderMeta", {
                    count: order.itemCount,
                    date: format.dateTime(new Date(order.orderedAt), {
                      day: "numeric",
                      month: "short",
                    }),
                  })}
                </p>
              </div>
            </Link>
          ))}
        </Rail>
      )}
    </section>
  );
}
