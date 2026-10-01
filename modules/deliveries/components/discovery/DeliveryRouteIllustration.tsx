import { House, Store } from "lucide-react";
import styles from "./discovery-cards.module.css";

/** Store-to-door route; endpoints are in percent so icons track the scaled SVG. */
const ROUTE = "M10 78 C 30 78, 30 40, 50 46 S 72 22, 90 24";

export function DeliveryRouteIllustration() {
  return (
    <div aria-hidden="true" className="relative h-28 w-full sm:h-32">
      <svg
        className="absolute inset-0 size-full overflow-visible"
        preserveAspectRatio="none"
        viewBox="0 0 100 100"
      >
        <path
          d={ROUTE}
          fill="none"
          stroke="currentColor"
          strokeDasharray="2 6"
          strokeLinecap="round"
          strokeWidth="2"
          className="text-ink/15"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <svg
        className={`${styles.route} absolute inset-0 size-full overflow-visible text-brand`}
        preserveAspectRatio="none"
        viewBox="0 0 100 100"
      >
        <path
          d={ROUTE}
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="4"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <span className="absolute left-[10%] top-[78%] grid size-10 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-card text-brand shadow-rail-card ring-1 ring-line">
        <Store className="size-[18px]" />
      </span>
      <span className="absolute left-[90%] top-[24%] -translate-x-1/2 -translate-y-1/2">
        <span className={`${styles.destinationPulse} absolute inset-0 rounded-full bg-brand`} />
        <span className="relative grid size-10 place-items-center rounded-full bg-brand text-ink shadow-rail-card">
          <House className="size-[18px]" />
        </span>
      </span>
    </div>
  );
}
