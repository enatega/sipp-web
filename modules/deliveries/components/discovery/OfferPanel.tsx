import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { BannerMedia } from "./BannerMedia";
import type { DeliveryBanner } from "@/modules/deliveries/types/discovery";
import styles from "./offers-carousel.module.css";

function bannerHref(banner: DeliveryBanner) {
  if (banner.actionType === "store") {
    const storeId = banner.relatedStore?.trim() || banner.store?.id?.trim();
    return storeId ? `/restaurants/${encodeURIComponent(storeId)}` : null;
  }
  if (banner.actionType === "product") {
    const storeId = banner.product?.storeId?.trim();
    const productId = banner.relatedProduct?.trim() || banner.product?.id?.trim();
    return storeId && productId
      ? `/restaurants/${encodeURIComponent(storeId)}?productId=${encodeURIComponent(productId)}`
      : null;
  }
  if (banner.actionType === "all_restaurants") {
    return "/discovery/all/stores";
  }
  if (banner.actionType === "shop_type") {
    const shopTypeId =
      banner.relatedShopType?.trim() || banner.shopType?.id?.trim();
    return shopTypeId
      ? `/discovery/all/stores?shopTypeId=${encodeURIComponent(shopTypeId)}&title=${encodeURIComponent(banner.shopType?.name?.trim() || banner.title?.trim() || "Stores")}`
      : null;
  }
  return null;
}

interface Props {
  banner: DeliveryBanner;
  ctaLabel: string;
}

export function OfferPanel({ banner, ctaLabel }: Props) {
  const href = bannerHref(banner);
  const title = banner.title?.trim();
  const hasCopy = Boolean(title || banner.description?.trim());
  const accessibleName = [ctaLabel, title || banner.shopType?.name?.trim()]
    .filter(Boolean)
    .join(": ");
  const panel = (
    <article
      className={`${styles.panel} ${hasCopy ? styles.withCopy : ""} relative h-32 overflow-hidden bg-brand sm:h-52 lg:h-[clamp(10rem,16vw,16.25rem)]`}
    >
      <div className={styles.media}>
        <BannerMedia banner={banner} />
      </div>
      {hasCopy ? (
        <div className={`${styles.copy} absolute inset-y-0 left-0 z-10 flex w-[68%] flex-col justify-center px-4 sm:w-[57%] sm:px-6 lg:w-[48%] lg:px-8`}>
          {title ? (
            <h2 className="line-clamp-2 font-heading text-xl font-extrabold leading-[1.06] tracking-[-0.03em] text-white sm:text-3xl lg:text-[clamp(1.5rem,2.25vw,2.8rem)]">
              {title}
            </h2>
          ) : null}
          {banner.description?.trim() ? (
            <p className="mt-2 line-clamp-1 text-xs text-white sm:text-sm">
              {banner.description}
            </p>
          ) : null}
          {href ? (
            <span className="mt-3 inline-flex min-h-9 w-fit items-center gap-1.5 rounded-full bg-white px-3.5 py-2 text-xs font-bold text-[#142938] sm:mt-4 sm:px-4 sm:text-sm">
              {ctaLabel}
              <ArrowUpRight aria-hidden="true" className="size-4 text-brand" />
            </span>
          ) : null}
        </div>
      ) : null}
    </article>
  );

  return href ? (
    <Link
      aria-label={accessibleName}
      className={`${styles.offerLink} group block`}
      href={href}
    >
      {panel}
    </Link>
  ) : (
    <div className="group">{panel}</div>
  );
}
