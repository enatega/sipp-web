import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { DeliveryImage } from "@/modules/deliveries/components/discovery/DeliveryImage";
import type { DeliveryShopType } from "@/modules/deliveries/types/discovery";
import { decodeDisplayText } from "@/modules/deliveries/utils/discoveryMappers";
import styles from "./discovery-cards.module.css";
import { ShopTypeArtwork } from "./ShopTypeArtwork";
import groceryArt from "@/public/images/browse/grocery.webp";
import restaurantArt from "@/public/images/browse/restaurant.webp";

/** Branded artwork for the shop types SIPP launches with; others fall back to their own photo. */
const ARTWORK = {
  grocery: {
    tone: undefined,
    eyebrow: "good",
    src: groceryArt,
    className: "bottom-0 end-0 h-[112%] max-w-[60%] sm:h-[118%] sm:max-w-[66%]",
  },
  restaurant: {
    tone: styles.browseMint,
    eyebrow: "fresh",
    src: restaurantArt,
    className: "bottom-[4%] end-[3%] h-[100%] max-w-[48%] sm:bottom-[3%] sm:end-[4%] sm:h-[110%] sm:max-w-[50%]",
  },
} as const;

/** Tones cycled for shop types without branded artwork. */
const FALLBACK_TONES = [
  { tone: styles.browseSky, eyebrow: "local" },
  { tone: styles.browseLilac, eyebrow: "worth" },
] as const;

type ArtworkKind = keyof typeof ARTWORK;

function artworkKind(item: DeliveryShopType): ArtworkKind | null {
  const key = `${item.slug ?? ""} ${item.name}`.toLowerCase();
  if (/grocer|supermarket/.test(key)) return "grocery";
  if (/restaurant|food|meal/.test(key)) return "restaurant";
  return null;
}

interface Props {
  item: DeliveryShopType;
  href: string;
  index: number;
}

export function ShopTypeCard({ item, href, index }: Props) {
  const t = useTranslations("deliveries.discovery");
  const kind = artworkKind(item);
  const artwork = kind ? ARTWORK[kind] : null;
  const { tone, eyebrow } = artwork ?? FALLBACK_TONES[index % FALLBACK_TONES.length];
  const name = decodeDisplayText(item.name);
  const rawDescription = item.description?.trim()
    ? decodeDisplayText(item.description).trim()
    : null;
  const description =
    rawDescription && rawDescription.toLowerCase() !== name.trim().toLowerCase()
      ? rawDescription
      : kind
        ? t(`shopTypeTaglines.${kind}`)
        : null;

  return (
    <Link
      className={cn(
        styles.browseCard,
        tone,
        "group relative isolate flex h-48 flex-col justify-center focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand sm:h-[11.5rem] lg:h-48",
      )}
      href={href}
    >
      <div className="relative z-10 min-w-0 px-4 min-[400px]:px-5 sm:px-8">
        <span className={cn(styles.browseEyebrow, "block max-w-[60%] truncate text-[10px] font-bold uppercase tracking-[0.08em] sm:text-xs")}>
          {t(`shopTypeEyebrows.${eyebrow}`)}
        </span>
        <h3 className="mt-0.5 whitespace-nowrap font-heading text-[22px] font-extrabold leading-tight tracking-[-0.02em] min-[400px]:text-[26px] sm:text-[32px]">
          {name}
        </h3>
        {description ? (
          <p className="mt-0.5 line-clamp-2 max-w-[50%] text-[11px] font-medium leading-snug min-[400px]:text-xs sm:max-w-[48%] sm:text-[13px]">{description}</p>
        ) : null}
        <span
          className={cn(
            styles.browsePill,
            "mt-3.5 inline-flex items-center gap-2 whitespace-nowrap rounded-full py-2.5 pe-3.5 ps-4 text-xs font-bold transition-[gap] duration-300 group-hover:gap-3 min-[400px]:gap-3 min-[400px]:pe-4 min-[400px]:ps-5 sm:mt-6 sm:gap-6 sm:py-3 sm:pe-5 sm:ps-6 sm:text-[13px] sm:group-hover:gap-7",
          )}
        >
          <span>{t("browseShopType", { name })}</span>
          <ArrowRight aria-hidden="true" className="size-4 shrink-0 rtl:rotate-180 sm:size-[18px]" strokeWidth={2.25} />
        </span>
      </div>

      {artwork ? (
        <ShopTypeArtwork className={artwork.className} isPreloaded={index < 2} src={artwork.src} />
      ) : (
        <div aria-hidden="true" className={cn(styles.browseArt, "absolute end-5 top-1/2 size-28 -translate-y-1/2 overflow-hidden rounded-full border-[6px] border-white/70 sm:end-8 sm:size-36")}>
          <DeliveryImage alt="" className="size-full" sizes="144px" src={item.image ?? item.icon} />
        </div>
      )}
    </Link>
  );
}
