import { Tag } from "lucide-react";
import { cn } from "@/lib/utils";
import { DeliveryImage } from "@/modules/deliveries/components/discovery/DeliveryImage";
import type { DeliveryTopBrand } from "@/modules/deliveries/types/discovery";
import styles from "./discovery-cards.module.css";

interface Props {
  brand: DeliveryTopBrand;
  offLabel: string;
}

/** Story-style brand bubble: round logo in a gradient ring, deal pill on the rim, name below. */
export function TopBrandCard({ brand, offLabel }: Props) {
  const deal = brand.dealAmount
    ? `${brand.dealAmount}${brand.dealType === "percentage" ? "%" : ""} ${offLabel}`
    : brand.deal;

  return (
    <article className="group flex w-[5.25rem] shrink-0 snap-start min-[400px]:w-24 flex-col items-center sm:w-[9.5rem]">
      <div className="relative transition-transform duration-300 ease-out group-hover:-translate-y-1">
        <div className={cn(styles.brandRing, "size-[4.75rem] min-[400px]:size-[5.5rem] rounded-full p-[2.5px] sm:size-32 sm:p-[3px]")}>
          <div className="size-full rounded-full bg-card p-[2.5px] shadow-rail-card sm:p-[3px]">
            <DeliveryImage
              alt={brand.name}
              className="size-full rounded-full"
              imageClassName="transition-transform duration-500 ease-out group-hover:scale-110"
              sizes="(max-width: 640px) 88px, 128px"
              src={brand.logo}
            />
          </div>
        </div>
        {deal ? (
          <span className="absolute -bottom-1.5 left-1/2 inline-flex max-w-[115%] -translate-x-1/2 items-center gap-0.5 whitespace-nowrap rounded-full bg-brand px-1.5 py-px text-[9px] sm:max-w-[110%] sm:gap-1 sm:px-2 sm:py-0.5 sm:text-[10px] font-bold text-ink shadow-sm ring-2 ring-card">
            <Tag aria-hidden="true" className="size-2.5 shrink-0 sm:size-3" />
            <span className="truncate">{deal}</span>
          </span>
        ) : null}
      </div>
      <h3 className="mt-2.5 line-clamp-2 w-full text-center text-[11px] font-bold leading-[0.875rem] min-[400px]:text-xs sm:mt-3 sm:text-[13px] sm:leading-4 text-ink transition-colors group-hover:text-brand [overflow-wrap:anywhere]">
        {brand.name}
      </h3>
    </article>
  );
}
