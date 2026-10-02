import { useId } from "react";
import { House, Motorbike, Store } from "lucide-react";
import { TrackingStatusCard } from "./TrackingStatusCard";
import styles from "./discovery-cards.module.css";

/** Store-to-door route in map units; `.courier` in the CSS module rides the same path. */
const ROUTE = "M38 112 C 70 112, 66 72, 100 72 S 140 40, 176 34";
const STREET_X = [70, 134];
const STREET_Y = [60, 92];
const COLUMNS = [[0, 66], [74, 130], [138, 200]];
const ROWS = [[0, 56], [64, 88], [96, 140]];

export function DeliveryRouteIllustration() {
  const id = useId();
  const markerFill = `${id}-marker`;

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
      <svg className="absolute inset-0 size-full" preserveAspectRatio="none" viewBox="0 0 100 100">
        <g className={styles.cloudDrift}>
          <ellipse className={styles.cloud} cx="10" cy="14" rx="9" ry="4.5" />
          <ellipse className={styles.cloud} cx="16" cy="11" rx="6" ry="4.5" />
          <ellipse className={styles.cloud} cx="40" cy="22" rx="6" ry="3" />
        </g>
      </svg>

      <div className="absolute inset-x-5 top-5 h-56 sm:inset-x-auto sm:inset-y-6 sm:right-6 sm:h-auto sm:w-[48%]">
        <div className={`${styles.map} absolute inset-0 overflow-hidden rounded-[22px]`}>
          <svg className="size-full" preserveAspectRatio="xMidYMid slice" viewBox="0 0 200 140">
            <defs>
              <linearGradient id={markerFill} x1="0" x2="1" y1="0" y2="1">
                <stop offset="0" stopColor="#8fd3fb" />
                <stop offset="1" stopColor="#2c8fe0" />
              </linearGradient>
            </defs>

            {COLUMNS.flatMap(([x1, x2], column) =>
              ROWS.map(([y1, y2], row) =>
                column === 0 && row === 0 ? (
                  <rect className={styles.mapPark} height={y2 - y1 - 12} key={`${column}-${row}`} rx="8" width={x2 - x1 - 12} x={x1 + 6} y={y1 + 6} />
                ) : (
                  <rect className={styles.mapBlock} height={y2 - y1 - 12} key={`${column}-${row}`} rx="6" width={x2 - x1 - 12} x={x1 + 6} y={y1 + 6} />
                ),
              ),
            )}
            <path className={styles.mapWater} d="M128 140 C 138 118, 168 110, 200 108 V140 Z" />
            {STREET_X.map((x) => (
              <line className={styles.mapStreet} key={`x${x}`} strokeWidth="7" x1={x} x2={x} y1="0" y2="140" />
            ))}
            {STREET_Y.map((y) => (
              <line className={styles.mapStreet} key={`y${y}`} strokeWidth="7" x1="0" x2="200" y1={y} y2={y} />
            ))}

            <path d={ROUTE} fill="none" stroke="#fff" strokeLinecap="round" strokeWidth="8" />
            <path className="text-brand/45" d={ROUTE} fill="none" stroke="currentColor" strokeDasharray="1 6" strokeLinecap="round" strokeWidth="3" />
            <path className={`${styles.routeDriven} text-brand`} d={ROUTE} fill="none" pathLength={100} stroke="currentColor" strokeLinecap="round" strokeWidth="4.5" />

            <g transform="translate(38 112)">
              <circle className="fill-card" r="11" stroke="#2c8fe0" strokeWidth="2" />
              <Store className="text-brand" height={11} width={11} x={-5.5} y={-5.5} strokeWidth={2.4} />
            </g>

            <g transform="translate(176 34)">
              <circle className="fill-brand/20" r="17" />
              <circle fill={`url(#${markerFill})`} r="12" stroke="#fff" strokeWidth="2.5" />
              <House className="text-white" height={12} width={12} x={-6} y={-6} strokeWidth={2.4} />
            </g>

            <g className={styles.courier}>
              <circle fill="rgb(20 70 130 / 0.18)" cy="3" r="13" />
              <circle fill={`url(#${markerFill})`} r="12" stroke="#fff" strokeWidth="2.5" />
              <Motorbike className="text-white" height={13} width={13} x={-6.5} y={-6.5} strokeWidth={2.4} />
            </g>
          </svg>
        </div>

        <TrackingStatusCard className="absolute bottom-3 right-3 sm:-left-8 sm:bottom-auto sm:right-auto sm:top-8" />
      </div>
    </div>
  );
}
