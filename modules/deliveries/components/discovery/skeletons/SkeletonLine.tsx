import { cn } from "@/lib/utils";
import { SkeletonBlock } from "./SkeletonBlock";

interface Props {
  /** The real text element's typography and spacing classes. */
  className?: string;
  /** Width (and any shape overrides) of the visible bar. */
  barClassName?: string;
  isStrong?: boolean;
}

/**
 * A text placeholder that takes the exact line-box height of the copy it
 * replaces: pass the same font-size/line-height classes as the real element.
 */
export function SkeletonLine({ className, barClassName, isStrong }: Props) {
  return (
    <span aria-hidden="true" className={cn("block", className)}>
      <SkeletonBlock
        className={cn("inline-block h-[0.72em] max-w-full align-middle", barClassName)}
        isStrong={isStrong}
      />
    </span>
  );
}
