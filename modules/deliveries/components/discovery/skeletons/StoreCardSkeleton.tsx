import { SkeletonBlock } from "./SkeletonBlock";
import { SkeletonLine } from "./SkeletonLine";

/** Mirrors `StoreCard`: 16:9 cover, name, category and a divided meta row. */
export function StoreCardSkeleton() {
  return (
    <div className="w-[252px] shrink-0 snap-start overflow-hidden rounded-2xl bg-card shadow-rail-card ring-1 ring-line sm:w-[282px]">
      <SkeletonBlock className="aspect-[16/9] w-full rounded-none" />
      <div className="p-3.5 sm:p-4">
        <SkeletonLine barClassName="w-3/5" className="font-heading text-[15px] font-bold" />
        <SkeletonLine barClassName="w-2/5" className="mt-0.5 text-xs" />
        <div className="mt-3 flex items-center gap-x-3 border-t border-line pt-3 text-[10px]">
          <SkeletonLine barClassName="w-12" />
          <SkeletonLine barClassName="w-9" />
          <SkeletonLine barClassName="w-10" />
        </div>
      </div>
    </div>
  );
}
