import { cn } from "@/lib/utils";
import styles from "./skeleton.module.css";

interface Props {
  className?: string;
  /** Use on soft surfaces so the block stays visible. */
  isStrong?: boolean;
}

/** Decorative shimmer placeholder; size and shape come from `className`. */
export function SkeletonBlock({ className, isStrong = false }: Props) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        styles.block,
        isStrong && styles.strong,
        "block rounded-md",
        className,
      )}
    />
  );
}
