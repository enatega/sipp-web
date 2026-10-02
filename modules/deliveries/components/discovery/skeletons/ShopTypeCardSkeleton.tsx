import { SkeletonBlock } from "./SkeletonBlock";
import { SkeletonLine } from "./SkeletonLine";

/** Mirrors `ShopTypeCard`: copy and pill on the left, artwork on the right. */
export function ShopTypeCardSkeleton() {
  return (
    <div className="flex h-48 items-center justify-between gap-3 overflow-hidden rounded-[1.25rem] bg-[var(--soft-surface)] px-5 sm:h-[11.5rem] sm:px-8 lg:h-48">
      <div className="min-w-0 flex-1">
        <SkeletonLine barClassName="w-24 sm:w-32" className="text-[10px] font-bold sm:text-xs" isStrong />
        <SkeletonLine barClassName="w-32 sm:w-44" className="mt-0.5 font-heading text-[26px] font-extrabold leading-tight sm:text-[32px]" isStrong />
        <SkeletonLine barClassName="w-36 sm:w-52" className="mt-0.5 text-xs sm:text-[13px]" />
        <SkeletonBlock className="mt-4 h-10 w-36 rounded-full sm:mt-6 sm:h-11 sm:w-44" isStrong />
      </div>
      <SkeletonBlock className="size-28 shrink-0 rounded-[2rem] sm:size-36" isStrong />
    </div>
  );
}
