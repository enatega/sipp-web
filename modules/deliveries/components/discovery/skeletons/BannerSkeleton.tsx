import { SkeletonBlock } from "./SkeletonBlock";
import styles from "../offers-carousel.module.css";

/** Reserves the same shallow footprint as the loaded offer pair. */
export function BannerSkeleton() {
  return (
    <div aria-hidden="true" className={`${styles.pair} grid h-32 overflow-hidden rounded-2xl sm:h-52 lg:h-[clamp(10rem,16vw,16.25rem)] lg:grid-cols-2`}>
      <SkeletonBlock className="h-full w-full" isStrong />
      <SkeletonBlock className="hidden h-full w-full lg:block" />
      <SkeletonBlock className="absolute left-1/2 top-1/2 z-20 hidden size-[72px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white lg:block" isStrong />
    </div>
  );
}
