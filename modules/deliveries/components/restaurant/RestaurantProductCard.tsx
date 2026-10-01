import { Check, Plus } from "lucide-react";
import { useFormatter, useLocale, useTranslations } from "next-intl";
import { formatAppCurrency } from "@/config/currency";
import { DeliveryImage } from "../discovery/DeliveryImage";
import type { RestaurantProduct } from "../../types/restaurant";
import { getLocalizedProductName } from "../../utils/productTranslation";

interface Props {
  cartQuantity: number;
  isStoreAvailable: boolean;
  onSelect: (productId: string) => void;
  product: RestaurantProduct;
}

export function RestaurantProductCard({
  cartQuantity,
  isStoreAvailable,
  onSelect,
  product,
}: Props) {
  const t = useTranslations("deliveries.restaurant");
  const format = useFormatter();
  const locale = useLocale();
  const productName = getLocalizedProductName(product, locale);
  const price = product.deal?.discountedPrice ?? product.price;
  const isInCart = cartQuantity > 0;
  const isOutOfStock = !product.inStock;

  return (
    <article className={`group overflow-hidden rounded-2xl border bg-card shadow-rail-card transition duration-300 ease-out ${isOutOfStock ? "border-line hover:border-line hover:shadow-card" : `hover:-translate-y-0.5 hover:border-brand/25 hover:shadow-card ${isInCart ? "border-brand/25" : "border-line"}`}`}>
      <button
        aria-label={isOutOfStock ? t("viewOutOfStockProduct", { name: productName }) : isInCart ? t("configureProductInCart", { name: productName, count: cartQuantity }) : t("configureProduct", { name: productName })}
        className="flex min-h-[110px] w-full text-left focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-brand"
        onClick={() => onSelect(product.id)}
        type="button"
      >
        <div className="relative m-2.5 shrink-0 self-start">
          <DeliveryImage
            alt={productName}
            className={`size-[90px] rounded-[14px] border border-line bg-[var(--soft-surface)] sm:size-24 ${isOutOfStock ? "opacity-50 grayscale" : ""}`}
            imageClassName={isOutOfStock ? undefined : "transition duration-300 ease-out group-hover:scale-[1.03]"}
            sizes="96px"
            src={product.imageUrl}
          />
          {isOutOfStock ? (
            <span className="absolute inset-x-1.5 bottom-1.5 truncate rounded-full bg-black/70 px-1.5 py-0.5 text-center text-[9px] font-bold uppercase tracking-wide text-white">
              {t("outOfStock")}
            </span>
          ) : null}
        </div>
        <div className={`flex min-w-0 flex-1 flex-col self-stretch py-3 pl-0.5 pr-3 ${isOutOfStock ? "opacity-60" : ""}`}>
          <div className="min-w-0 flex-1">
            <h3 className="line-clamp-2 text-[13px] font-bold leading-[18px] tracking-[-0.01em] text-ink">
              {productName}
            </h3>
            <p className="mt-1 line-clamp-2 text-[10px] leading-[15px] text-muted">
              {product.shortDescription ?? product.description ?? t("productDescriptionFallback")}
            </p>
          </div>
          <div className="mt-2 flex items-end justify-between gap-2">
            <div className="flex min-w-0 items-center gap-1.5">
              <b className="text-[13px] text-brand">
                {formatAppCurrency(format, price)}
              </b>
              {product.deal ? (
                <span className="truncate text-[9px] text-muted line-through">
                  {formatAppCurrency(format, product.price)}
                </span>
              ) : null}
            </div>
            {isOutOfStock ? <span aria-hidden="true" className="grid size-7 shrink-0 cursor-not-allowed place-items-center rounded-full border border-line bg-soft-surface text-muted opacity-60"><Plus className="size-3.5" /></span> : !isStoreAvailable ? <span className="text-xs font-medium text-muted">{t("closed")}</span> : <span className={`relative grid size-7 shrink-0 place-items-center rounded-full border transition duration-200 group-hover:scale-105 ${isInCart ? "border-brand bg-brand text-ink" : "border-brand/25 bg-brand/8 text-brand group-hover:border-brand group-hover:bg-brand group-hover:text-ink"}`}>
              {isInCart ? <Check aria-hidden="true" className="size-3.5" /> : <Plus aria-hidden="true" className="size-3.5" />}
              {isInCart ? <span aria-hidden="true" className="absolute -right-1.5 -top-1.5 grid min-h-4 min-w-4 place-items-center rounded-full border-2 border-card bg-surface px-0.5 text-[8px] font-extrabold leading-none text-brand tabular-nums">{cartQuantity > 99 ? "99+" : cartQuantity}</span> : null}
            </span>}
          </div>
        </div>
      </button>
    </article>
  );
}
