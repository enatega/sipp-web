import { SkeletonBlock } from "./SkeletonBlock";
import { SkeletonLine } from "./SkeletonLine";

/** Mirrors the side-by-side `DealCard` layout. */
export function DealCardSkeleton() {
  return (
    <div className="flex w-full flex-col items-stretch gap-2.5 overflow-hidden rounded-[1.25rem] bg-card p-2 shadow-rail-card ring-1 ring-line sm:flex-row sm:items-center sm:gap-3.5 sm:rounded-[1.5rem] sm:p-2.5">
      <SkeletonBlock className="aspect-[16/9] w-full shrink-0 rounded-[0.9rem] sm:aspect-[4/3] sm:w-40 sm:rounded-[1.1rem] lg:w-44" />
      <div className="flex min-w-0 flex-1 items-center gap-2 px-1 pb-1 sm:gap-2 sm:px-0 sm:py-1">
        <div className="min-w-0 flex-1">
          <SkeletonLine barClassName="w-20" className="text-[9px] font-bold tracking-[0.18em] sm:text-[10px]" />
          <SkeletonLine barClassName="w-4/5" className="mt-0.5 font-heading text-sm font-extrabold sm:text-base" />
          <SkeletonLine barClassName="w-2/5" className="text-[11px] sm:text-xs" />
          <SkeletonLine barClassName="w-3/5" className="mt-2 text-[11px]" />
        </div>
        <SkeletonBlock className="size-8 shrink-0 rounded-full sm:size-10" />
      </div>
    </div>
  );
}
