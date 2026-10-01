import { SkeletonBlock } from "./SkeletonBlock";

/** Mirrors an image-only `OffersCarousel` banner (3:1, no overlay copy). */
export function BannerSkeleton() {
  return <SkeletonBlock className="aspect-[3/1] w-full rounded-2xl" isStrong />;
}
