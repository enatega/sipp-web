import { SkeletonBlock } from "./SkeletonBlock";
import { ShopTypeCardSkeleton } from "./ShopTypeCardSkeleton";

/** Mirrors `ShopTypeCarousel`: two tiles per view, scroll controls on phones. */
export function ShopTypesSkeleton() {
  return (
    <div aria-hidden="true">
      <div className="-mx-4 flex gap-3 overflow-hidden px-4 pb-6 pt-3 sm:mx-0 sm:gap-4 sm:px-0">
        {Array.from({ length: 2 }, (_, index) => (
          <div className="shrink-0 basis-[80%] sm:basis-[calc((100%-1rem)/2)]" key={index}>
            <ShopTypeCardSkeleton />
          </div>
        ))}
      </div>
      <div className="mt-1 flex items-center gap-3 sm:hidden">
        <SkeletonBlock className="h-1 flex-1 rounded-full" />
        <SkeletonBlock className="size-10 rounded-full" />
        <SkeletonBlock className="size-10 rounded-full" />
      </div>
    </div>
  );
}
