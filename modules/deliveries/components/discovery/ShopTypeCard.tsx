import Link from "next/link";
import { Store } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { DeliveryImage } from "@/modules/deliveries/components/discovery/DeliveryImage";
import type { DeliveryShopType } from "@/modules/deliveries/types/discovery";
import { decodeDisplayText } from "@/modules/deliveries/utils/discoveryMappers";
import styles from "./discovery-cards.module.css";

/** Tile tones and eyebrows cycled across cards so neighbours never match. */
const TONES = [
  { tone: undefined, eyebrow: "good" },
  { tone: styles.tileMint, eyebrow: "fresh" },
  { tone: styles.tileSky, eyebrow: "local" },
  { tone: styles.tileLilac, eyebrow: "worth" },
] as const;

interface Props {
  item: DeliveryShopType;
  href: string;
  index: number;
}

export function ShopTypeCard({ item, href, index }: Props) {
  const t = useTranslations("deliveries.discovery");
  const { tone, eyebrow } = TONES[index % TONES.length];
  const name = decodeDisplayText(item.name);
  const rawDescription = item.description?.trim()
    ? decodeDisplayText(item.description).trim()
    : null;
  const description =
    rawDescription && rawDescription.toLowerCase() !== name.trim().toLowerCase()
      ? rawDescription
      : null;

  return (
    <Link
      className={cn(
        styles.tile,
        tone,
        index % 2 === 1 && styles.tileTiltRight,
        "group relative flex h-full min-h-44 items-center justify-between gap-3 overflow-hidden rounded-[1.25rem] px-4 py-5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand sm:min-h-52 sm:gap-5 sm:px-7 sm:py-7",
      )}
      href={href}
    >
      <div className="min-w-0 flex-1">
        <span className="block truncate text-[9px] font-bold uppercase tracking-[0.14em] opacity-80 sm:text-[11px]">
          {t(`shopTypeEyebrows.${eyebrow}`)}
        </span>
        <h3 className="mt-1.5 truncate font-heading text-[22px] font-extrabold leading-tight tracking-[-0.03em] sm:mt-2 sm:text-[31px]">
          {name}
        </h3>
        {description ? (
          <p className="mt-1 line-clamp-2 text-xs opacity-80 sm:mt-1.5 sm:text-sm">
            {description}
          </p>
        ) : null}
        <span
          className={cn(
            styles.tilePill,
            "mt-4 inline-flex max-w-full items-center gap-2 rounded-full px-3 py-2 text-[11px] font-bold transition-[gap] duration-300 group-hover:gap-3 sm:mt-5 sm:gap-3 sm:px-3.5 sm:py-2.5 sm:text-[13px] sm:group-hover:gap-4",
          )}
        >
          <span className="truncate">{t("browseShopType", { name })}</span>
          <Store aria-hidden="true" className="size-3.5 shrink-0 sm:size-4" strokeWidth={2} />
        </span>
      </div>
      <div
        aria-hidden="true"
        className={cn(
          styles.tilePhoto,
          "size-22 shrink-0 overflow-hidden rounded-full sm:size-28 lg:size-36",
        )}
        style={{ "--float-delay": `${(index % 2) * -2.5}s` } as React.CSSProperties}
      >
        <DeliveryImage
          alt=""
          className="size-full"
          imageClassName="transition-[scale] duration-500 ease-out group-hover:scale-[1.08]"
          sizes="(max-width: 560px) 88px, 144px"
          src={item.image ?? item.icon}
        />
      </div>
    </Link>
  );
}
