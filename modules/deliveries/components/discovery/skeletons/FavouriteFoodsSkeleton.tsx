import { SkeletonBlock } from "./SkeletonBlock";
import styles from "../favourite-foods.module.css";

/** Matches the square food cards so loading does not shift the section. */
export function FavouriteFoodsSkeleton() {
  return (
    <div aria-busy="true" className="flex gap-3 overflow-hidden py-2 sm:gap-4">
      {Array.from({ length: 8 }, (_, index) => (
        <div
          aria-hidden="true"
          className={`${styles.item} flex flex-col overflow-hidden rounded-xl bg-card ring-1 ring-line`}
          key={index}
        >
          <SkeletonBlock className="min-h-0 w-full flex-1 rounded-none" />
          <div className="flex h-12 shrink-0 items-center px-3">
            <SkeletonBlock className="h-3 w-2/3 rounded-full" isStrong />
          </div>
        </div>
      ))}
    </div>
  );
}
