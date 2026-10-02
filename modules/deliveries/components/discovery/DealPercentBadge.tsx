import { Percent } from "lucide-react";
import { DealSparkle } from "@/modules/deliveries/components/discovery/DealSparkle";

/** Glossy pink "%" tile resting on the top-right corner of the deals panel. */
export function DealPercentBadge() {
  return (
    <span aria-hidden="true" className="pointer-events-none absolute -top-5 right-1 z-20 sm:-right-3 sm:-top-6 lg:-right-4 lg:-top-7">
      <DealSparkle className="absolute -right-4 -top-4 size-5 rotate-[200deg] text-promo sm:size-6" />
      <span className="relative grid size-12 rotate-[-10deg] place-items-center rounded-[1.1rem] bg-[linear-gradient(150deg,var(--color-promo-light)_0%,var(--color-promo)_70%)] text-white shadow-[0_12px_24px_color-mix(in_srgb,var(--color-promo)_38%,transparent),inset_0_3px_2px_rgb(255_255_255/0.45),inset_0_-4px_8px_color-mix(in_srgb,var(--color-promo)_60%,black_8%)] sm:size-14 sm:rounded-[1.3rem] lg:size-16 lg:rounded-[1.4rem]">
        <Percent className="size-6 drop-shadow-sm sm:size-7 lg:size-8" strokeWidth={3.2} />
      </span>
    </span>
  );
}
