import Image from "next/image";
import { cn } from "@/lib/utils";
import styles from "@/modules/home/styles/home.module.css";

/**
 * Product-detail screen, cropped by the section edge as in the design.
 * Uses the real app screenshot rather than a rebuilt approximation.
 */
export function DetailPhone() {
  return (
    <div
      className={cn(styles.detailPhone, styles.phoneShot)}
      role="img"
      aria-label="Ordering a beef burger in the SIPP app"
    >
      <Image
        src="/app/screen-product.png"
        alt=""
        width={560}
        height={1217}
        sizes="(max-width: 860px) 48vw, 200px"
      />
    </div>
  );
}
