import Link from "next/link";
import { useFormatter, useLocale, useTranslations } from "next-intl";
import { formatAppCurrency } from "@/config/currency";
import { cn } from "@/lib/utils";
import { DeliveryImage } from "@/modules/deliveries/components/discovery/DeliveryImage";
import type { DeliveryOrderAgainProduct } from "@/modules/deliveries/types/discovery";
import { getLocalizedProductName } from "@/modules/deliveries/utils/productTranslation";

interface Props {
  product: DeliveryOrderAgainProduct;
  className?: string;
}

export function OrderAgainProductCard({ product, className }: Props) {
  const t = useTranslations("deliveries.discovery");
  const format = useFormatter();
  const locale = useLocale();
  const name = getLocalizedProductName(product, locale);
  const href = `/restaurants/${encodeURIComponent(product.storeId)}?productId=${encodeURIComponent(product.productId)}`;

  return (
    <Link
      className={cn(
        "group block overflow-hidden rounded-2xl bg-card shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-brand",
        className,
      )}
      href={href}
    >
      <DeliveryImage
        alt=""
        className="aspect-[16/9] w-full"
        imageClassName="transition-transform duration-500 ease-out group-hover:scale-105"
        sizes="(max-width: 640px) 270px, 310px"
        src={product.imageUrl ?? product.storeImage ?? product.storeLogo}
      />
      <div className="p-3.5 sm:p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate font-heading text-sm font-bold text-ink">{name}</h3>
            <p className="mt-1 truncate text-xs text-muted">{product.storeName}</p>
          </div>
          <div className="shrink-0 text-right">
            <b className="block text-xs text-brand">
              {formatAppCurrency(format, product.discountedPrice ?? product.price)}
            </b>
            {product.discountedPrice !== null ? (
              <s className="block text-[10px] text-muted">{formatAppCurrency(format, product.price)}</s>
            ) : null}
          </div>
        </div>
        {!product.inStock ? (
          <p className="mt-3 text-[10px] font-semibold text-danger">{t("outOfStock")}</p>
        ) : null}
      </div>
    </Link>
  );
}
