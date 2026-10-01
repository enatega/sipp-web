import { cn } from "@/lib/utils";
import { SkeletonBlock } from "./SkeletonBlock";
import { SkeletonLine } from "./SkeletonLine";

interface Props {
  layout?: "rail" | "wide";
}

/** Mirrors `DealCard` in both its rail and side-by-side layouts. */
export function DealCardSkeleton({ layout = "rail" }: Props) {
  const isWide = layout === "wide";
  return (
    <div
      className={cn(
        "flex overflow-hidden rounded-[1.35rem] bg-card p-1.5 shadow-rail-card ring-1 ring-line",
        isWide
          ? "w-full flex-row"
          : "h-full w-[204px] shrink-0 snap-start flex-col sm:w-[228px]",
      )}
    >
      <SkeletonBlock
        className={cn(
          "shrink-0 rounded-2xl",
          isWide ? "min-h-32 w-32 self-stretch sm:w-44" : "aspect-[16/10] w-full",
        )}
      />
      <div
        className={cn(
          "flex min-w-0 flex-1 flex-col",
          isWide ? "justify-center gap-2.5 px-3 py-2 sm:px-4" : "px-1.5 pb-0.5 pt-2.5",
        )}
      >
        <div>
          <SkeletonLine barClassName="w-16" className="text-[10px] font-bold tracking-[0.12em]" />
          <SkeletonLine
            barClassName="w-3/5"
            className={cn(
              "mt-0.5 font-heading font-extrabold",
              isWide ? "text-base sm:text-lg" : "text-[15px]",
            )}
          />
          <SkeletonLine barClassName="w-2/5" className="text-xs" />
          {isWide ? null : (
            <div className="mt-1.5 flex items-center gap-x-2.5 text-[11px]">
              <SkeletonLine barClassName="w-8" />
              <SkeletonLine barClassName="w-11" />
            </div>
          )}
        </div>
        <div className={cn("flex items-center justify-between gap-2", !isWide && "mt-auto pt-2.5")}>
          <SkeletonLine barClassName="w-20" className="text-sm" />
          <SkeletonBlock className="size-8 shrink-0 rounded-full" />
        </div>
      </div>
    </div>
  );
}
