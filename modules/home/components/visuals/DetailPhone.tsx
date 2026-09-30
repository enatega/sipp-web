import Image from "next/image";
import { cn } from "@/lib/utils";
import styles from "@/modules/home/styles/home.module.css";

/**
 * Product-detail screen, cropped by the section edge as in the design.
 * Uses the real app screenshot rather than a rebuilt approximation.
 */
export function DetailPhone({ ariaLabel }: { ariaLabel: string }) {
  return (
    <div
      className={cn(styles.detailPhone, styles.phoneShot)}
      role="img"
      aria-label={ariaLabel}
    >
      <Image
        src="/app/discovery-mockup.png"
        alt=""
        width={1170}
        height={2532}
        sizes="(max-width: 860px) 48vw, 200px"
      />
    </div>
  );
}
