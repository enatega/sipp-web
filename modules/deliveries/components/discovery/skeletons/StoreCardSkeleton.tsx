import { SkeletonBlock } from "./SkeletonBlock";
import { SkeletonLine } from "./SkeletonLine";

/** Mirrors `StoreCard`: 16:10 cover, name, category and an icon meta row. */
export function StoreCardSkeleton() {
  return (
    <div className="w-[200px] shrink-0 min-[400px]:w-[224px] snap-start overflow-hidden rounded-2xl bg-card shadow-rail-card ring-1 ring-line sm:w-[282px]">
      <SkeletonBlock className="aspect-[16/10] w-full rounded-none" />
      <div className="px-3 pb-3 pt-2.5 sm:px-4 sm:pb-4 sm:pt-3">
        <SkeletonLine barClassName="w-3/5" className="font-heading text-sm font-bold sm:text-base" />
        <SkeletonLine barClassName="w-2/5" className="mt-0.5 text-xs sm:text-[13px]" />
        <div className="mt-2 flex items-center gap-x-3 text-[11px] sm:mt-3 sm:gap-x-4 sm:text-xs">
          <SkeletonLine barClassName="w-14" />
          <SkeletonLine barClassName="w-12" />
          <SkeletonLine barClassName="w-12" />
        </div>
      </div>
    </div>
  );
}
