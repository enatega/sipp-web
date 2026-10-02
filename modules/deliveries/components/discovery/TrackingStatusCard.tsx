import { Motorbike } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import styles from "./discovery-cards.module.css";

interface Props {
  className?: string;
}

const STEPS = 4;
const COMPLETED_STEPS = 3;

/** Decorative preview of the live order status shown on the order page. */
export function TrackingStatusCard({ className }: Props) {
  const t = useTranslations("deliveries.discovery.features");

  return (
    <div className={cn(styles.statusCard, "w-40 rounded-xl bg-card p-2.5 shadow-pop min-[400px]:w-44 sm:w-52 sm:rounded-2xl sm:p-3 ring-1 ring-line", className)}>
      <div className="flex items-center gap-2 sm:gap-2.5">
        <span className={cn(styles.glossBadge, "grid size-7 shrink-0 place-items-center rounded-lg sm:size-9 sm:rounded-xl")}>
          <Motorbike className="size-3.5 sm:size-4.5" strokeWidth={2.4} />
        </span>
        <span className="min-w-0">
          <span className="block truncate text-xs font-extrabold leading-4 sm:text-[13px] text-ink">
            {t("trackStatus")}
          </span>
          <span className="mt-0.5 block truncate text-[10px] leading-3.5 sm:text-[11px] sm:leading-4 text-muted">
            {t("trackEta", { minutes: 12 })}
          </span>
        </span>
      </div>
      <div className="mt-2 grid grid-cols-4 gap-1 sm:mt-2.5">
        {Array.from({ length: STEPS }, (_, step) => (
          <span
            className={cn("h-1 rounded-full sm:h-1.5", step < COMPLETED_STEPS ? "bg-brand" : "bg-line")}
            key={step}
          />
        ))}
      </div>
    </div>
  );
}
