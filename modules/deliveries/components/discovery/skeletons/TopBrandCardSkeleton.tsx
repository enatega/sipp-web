import { SkeletonBlock } from "./SkeletonBlock";
import { SkeletonLine } from "./SkeletonLine";

/** Mirrors the top-brand tile: 4:3 logo above a two-line name. */
export function TopBrandCardSkeleton() {
  return (
    <div className="w-40 shrink-0 snap-start overflow-hidden rounded-2xl bg-card shadow-rail-card ring-1 ring-line sm:w-44">
      <SkeletonBlock className="aspect-[4/3] w-full rounded-none" />
      <div className="min-h-[4.75rem] px-3.5 py-3">
        <SkeletonLine barClassName="w-4/5" className="text-sm leading-5" />
        <SkeletonLine barClassName="w-1/2" className="text-sm leading-5" />
      </div>
    </div>
  );
}
