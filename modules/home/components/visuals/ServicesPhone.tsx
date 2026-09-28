import Image from "next/image";
import { cn } from "@/lib/utils";
import styles from "@/modules/home/styles/home.module.css";

/**
 * The multi-service home screen. This renders the real app screenshot inside
 * the phone frame, so the mock always matches what ships in the store.
 */
export function ServicesPhone({ ariaLabel }: { ariaLabel: string }) {
  return (
    <div className={cn(styles.phone, styles.phoneShot, styles.phoneTall)} role="img" aria-label={ariaLabel}>
      <Image
        src="/app/store-mockup.jpg"
        alt=""
        width={719}
        height={1600}
        sizes="(max-width: 860px) 60vw, 250px"
      />
    </div>
  );
}
