import Link from "next/link";
import { RotateCcw } from "lucide-react";
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
  const hasDiscount =
    product.discountedPrice !== null && product.discountedPrice < product.price;
  const savedPercent =
    hasDiscount && product.price > 0
      ? Math.round((1 - (product.discountedPrice ?? 0) / product.price) * 100)
      : 0;

  return (
    <Link
      className={cn(
        "group relative flex flex-col rounded-[1.5rem] bg-card p-2 shadow-[0_10px_30px_color-mix(in_srgb,var(--color-brand)_14%,transparent)] ring-1 ring-line/70 transition-[translate,box-shadow] duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_18px_40px_color-mix(in_srgb,var(--color-brand)_24%,transparent)] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-brand",
        className,
      )}
      href={href}
    >
      {/* Product "stage": a tinted backdrop with a plate the food sits on. */}
      <div className="relative isolate aspect-[16/11] overflow-hidden rounded-[1.15rem] bg-[linear-gradient(160deg,color-mix(in_srgb,var(--color-brand)_18%,var(--color-surface)),color-mix(in_srgb,var(--color-brand)_6%,var(--color-surface)))]">
        <span
          aria-hidden="true"
          className="absolute left-1/2 top-[58%] -z-1 aspect-square w-[68%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-card/80 shadow-[0_14px_30px_color-mix(in_srgb,var(--color-brand)_22%,transparent),inset_0_-6px_14px_color-mix(in_srgb,var(--color-brand)_10%,transparent)] ring-8 ring-card/40 transition-[scale] duration-500 ease-out group-hover:scale-105"
        />
        <DeliveryImage
          alt=""
          className={cn("absolute inset-0 bg-transparent", !product.inStock && "opacity-60 grayscale")}
          contain
          imageClassName="drop-shadow-[0_14px_14px_rgb(0_0_0/0.18)] transition-[scale,translate] duration-500 ease-out group-hover:-translate-y-1.5 group-hover:scale-[1.06]"
          sizes="(max-width: 640px) 220px, 256px"
          src={product.imageUrl ?? product.storeImage ?? product.storeLogo}
        />

        {product.storeLogo ? (
          <DeliveryImage
            alt=""
            className="absolute right-2.5 top-2.5 size-8 rounded-full ring-2 ring-card shadow-sm"
            sizes="32px"
            src={product.storeLogo}
          />
        ) : null}
        {savedPercent > 0 ? (
          <span className="absolute bottom-2.5 left-2.5 -rotate-6 rounded-lg bg-[linear-gradient(150deg,var(--color-promo-light),var(--color-promo)_70%)] px-2 py-0.5 font-heading text-[11px] font-extrabold uppercase text-white shadow-[0_6px_14px_color-mix(in_srgb,var(--color-promo)_35%,transparent)]">
            {savedPercent}% {t("off")}
          </span>
        ) : null}
        {!product.inStock ? (
          <span className="absolute inset-x-0 bottom-2.5 mx-auto w-fit rounded-full bg-black/70 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
            {t("outOfStock")}
          </span>
        ) : null}
      </div>

      <div className="flex items-end justify-between gap-3 px-1.5 pb-1 pt-3">
        <div className="min-w-0">
          <p className="truncate text-[10px] font-bold uppercase tracking-[0.18em] text-muted">
            {product.storeName}
          </p>
          <h3 className="mt-0.5 truncate font-heading text-[15px] font-extrabold leading-tight text-ink">
            {name}
          </h3>
          <p className="mt-1.5 flex items-baseline gap-1.5 tabular-nums">
            <b className="font-heading text-sm font-extrabold text-ink">
              {formatAppCurrency(format, hasDiscount ? product.discountedPrice ?? product.price : product.price)}
            </b>
            {hasDiscount ? (
              <s className="text-[11px] text-muted decoration-promo/70">
                {formatAppCurrency(format, product.price)}
              </s>
            ) : null}
          </p>
        </div>
        <span
          aria-hidden="true"
          className="grid size-10 shrink-0 place-items-center rounded-full bg-[linear-gradient(160deg,var(--color-brand)_0%,var(--color-brand-deep)_85%)] text-white shadow-[0_10px_22px_color-mix(in_srgb,var(--color-brand-deep)_40%,transparent),inset_0_2px_1px_rgb(255_255_255/0.4)] transition-[rotate,scale] duration-500 ease-out group-hover:-rotate-[200deg] group-hover:scale-110"
        >
          <RotateCcw className="size-4" strokeWidth={2.6} />
        </span>
      </div>
    </Link>
  );
}
