import { SkeletonBlock } from "./SkeletonBlock";
import { SkeletonLine } from "./SkeletonLine";

/** Mirrors the top-brand bubble: round logo with a centered name below. */
export function TopBrandCardSkeleton() {
  return (
    <div className="flex w-[5.25rem] shrink-0 snap-start min-[400px]:w-24 flex-col items-center sm:w-[9.5rem]">
      <SkeletonBlock className="size-[4.75rem] min-[400px]:size-[5.5rem] rounded-full sm:size-32" />
      <SkeletonLine barClassName="mx-auto w-3/4" className="mt-2.5 w-full text-[11px] leading-[0.875rem] min-[400px]:text-xs sm:mt-3 sm:text-[13px] sm:leading-4" />
    </div>
  );
}
