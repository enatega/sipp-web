import { useTranslations } from "next-intl";
import { OrderAgainProductCard } from "@/modules/deliveries/components/discovery/OrderAgainProductCard";
import { Rail, SectionHeading } from "@/modules/deliveries/components/discovery/DiscoverySection";
import type { DeliveryOrderAgainProduct } from "@/modules/deliveries/types/discovery";

interface Props {
  items: DeliveryOrderAgainProduct[];
  seeAllHref?: string;
  seeAllLabel?: string;
}

/**
 * Only rendered once the customer has order history. While loading, on
 * failure, or with no previous orders the section is omitted entirely so the
 * home screen never shows an empty or broken "Order again" heading.
 */
export function OrderAgainSection({ items, seeAllHref, seeAllLabel }: Props) {
  const t = useTranslations("deliveries.discovery");
  if (items.length === 0) return null;

  return (
    <section className="space-y-4">
      <SectionHeading
        actionHref={seeAllHref}
        actionLabel={seeAllLabel}
        title={t("orderAgainTitle")}
        description={t("orderAgainDescription")}
      />
      <Rail>
        {items.map((product) => (
          <OrderAgainProductCard
            className="w-[220px] shrink-0 snap-start sm:w-[256px]"
            key={`${product.storeId}:${product.productId}`}
            product={product}
          />
        ))}
      </Rail>
    </section>
  );
}
