import { LoaderCircle, Plus } from "lucide-react";
import { useFormatter, useLocale, useTranslations } from "next-intl";
import { useAppCurrencyFormatter } from "@/lib/useAppCurrency";
import { useQueryClient } from "@tanstack/react-query";
import { DeliveryImage } from "../discovery/DeliveryImage";
import { restaurantApi } from "../../api/restaurant";
import { deliveryQueryKeys } from "../../queries/queryKeys";
import type { RestaurantProduct } from "../../types/restaurant";
import { getLocalizedProductName } from "../../utils/productTranslation";

interface Props {
  cartQuantity: number;
  isQuickAddBlocked: boolean;
  isQuickAdding: boolean;
  isStoreAvailable: boolean;
  isWithinDeliveryArea: boolean;
  onQuickAdd: (product: RestaurantProduct) => void;
  onSelect: (productId: string) => void;
  product: RestaurantProduct;
}

export function RestaurantProductCard({
  cartQuantity,
  isQuickAddBlocked,
  isQuickAdding,
  isStoreAvailable,
  isWithinDeliveryArea,
  onQuickAdd,
  onSelect,
  product,
}: Props) {
  const t = useTranslations("deliveries.restaurant");
  const queryClient = useQueryClient();
  const format = useFormatter();
  const formatAppCurrency = useAppCurrencyFormatter();
  const locale = useLocale();
  const productName = getLocalizedProductName(product, locale);
  const price = product.deal?.discountedPrice ?? product.price;
  const isInCart = cartQuantity > 0;
  const isOutOfStock = !product.inStock;

  function prefetchProduct() {
    void queryClient.prefetchQuery({
      queryKey: deliveryQueryKeys.productInfo(product.id),
      queryFn: ({ signal }) => restaurantApi.productInfo(product.id, signal),
      staleTime: 2 * 60_000,
    });
    void queryClient.prefetchQuery({
      queryKey: deliveryQueryKeys.productCustomizations(product.id),
      queryFn: ({ signal }) => restaurantApi.productCustomizations(product.id, signal),
      staleTime: 2 * 60_000,
    });
  }

  return (
    <article className={`group relative overflow-hidden rounded-2xl border bg-card shadow-rail-card transition duration-300 ease-out ${isOutOfStock ? "border-line hover:border-line hover:shadow-card" : `hover:-translate-y-0.5 hover:border-brand/25 hover:shadow-card ${isInCart ? "border-brand/25" : "border-line"}`}`}>
      <button
        aria-label={isOutOfStock ? t("viewOutOfStockProduct", { name: productName }) : isInCart ? t("configureProductInCart", { name: productName, count: cartQuantity }) : t("configureProduct", { name: productName })}
        className="flex min-h-[110px] w-full text-left focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-brand"
        onClick={() => onSelect(product.id)}
        onFocus={prefetchProduct}
        onPointerEnter={prefetchProduct}
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
        <div className={`flex min-w-0 flex-1 flex-col self-stretch py-3 pe-12 ps-0.5 ${isOutOfStock ? "opacity-60" : ""}`}>
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
            {isOutOfStock ? <span className="text-xs font-semibold text-danger">{t("outOfStock")}</span> : !isWithinDeliveryArea ? <span className="text-xs font-medium text-muted">{t("outsideAreaShort")}</span> : !isStoreAvailable ? <span className="text-xs font-medium text-muted">{t("closed")}</span> : null}
          </div>
        </div>
      </button>
      {!isOutOfStock && isStoreAvailable && isWithinDeliveryArea ? (
        <button
          aria-label={t("quickAddProduct", { name: productName })}
          className={`absolute bottom-2.5 end-2.5 grid size-9 place-items-center rounded-full border transition-[background-color,border-color,transform] duration-200 hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-wait disabled:opacity-65 ${isInCart ? "border-brand bg-brand text-ink" : "border-brand/25 bg-brand/8 text-brand hover:border-brand hover:bg-brand hover:text-ink"}`}
          disabled={isQuickAddBlocked}
          onClick={() => onQuickAdd(product)}
          onFocus={prefetchProduct}
          onPointerEnter={prefetchProduct}
          type="button"
        >
          {isQuickAdding ? <LoaderCircle aria-hidden="true" className="size-4 animate-spin" /> : <Plus aria-hidden="true" className="size-4" />}
          {isInCart ? <span aria-hidden="true" className="absolute -end-1 -top-1 grid min-h-4 min-w-4 place-items-center rounded-full border-2 border-card bg-surface px-0.5 text-[8px] font-extrabold leading-none text-brand tabular-nums">{cartQuantity > 99 ? "99+" : cartQuantity}</span> : null}
        </button>
      ) : null}
    </article>
  );
}
