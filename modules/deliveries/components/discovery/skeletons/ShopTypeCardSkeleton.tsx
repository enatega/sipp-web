import { SkeletonBlock } from "./SkeletonBlock";
import { SkeletonLine } from "./SkeletonLine";

/** Mirrors `ShopTypeCard`: copy and pill on the left, round photo on the right. */
export function ShopTypeCardSkeleton() {
  return (
    <div className="flex h-full min-h-44 items-center justify-between gap-3 overflow-hidden rounded-[1.25rem] bg-[var(--soft-surface)] px-4 py-5 shadow-[0_5px_0_var(--line)] sm:min-h-52 sm:gap-5 sm:px-7 sm:py-7">
      <div className="min-w-0 flex-1">
        <SkeletonLine
          barClassName="w-24 sm:w-32"
          className="text-[9px] font-bold tracking-[0.14em] sm:text-[11px]"
          isStrong
        />
        <SkeletonLine
          barClassName="w-32 sm:w-48"
          className="mt-1.5 font-heading text-[22px] font-extrabold leading-tight sm:mt-2 sm:text-[31px]"
          isStrong
        />
        <span className="mt-4 inline-flex items-center gap-2 rounded-full border border-transparent bg-card/70 px-3 py-2 text-[11px] sm:mt-5 sm:gap-3 sm:px-3.5 sm:py-2.5 sm:text-[13px]">
          <SkeletonLine barClassName="w-24 sm:w-28" isStrong />
          <SkeletonBlock className="size-3.5 rounded sm:size-4" isStrong />
        </span>
      </div>
      <SkeletonBlock
        className="size-22 shrink-0 rounded-full sm:size-28 lg:size-36"
        isStrong
      />
    </div>
  );
}
