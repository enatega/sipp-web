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
    <div className={cn(styles.statusCard, "w-52 rounded-2xl bg-card p-3 shadow-pop ring-1 ring-line", className)}>
      <div className="flex items-center gap-2.5">
        <span className={cn(styles.glossBadge, "grid size-9 shrink-0 place-items-center rounded-xl")}>
          <Motorbike className="size-4.5" strokeWidth={2.4} />
        </span>
        <span className="min-w-0">
          <span className="block truncate text-[13px] font-extrabold leading-4 text-ink">
            {t("trackStatus")}
          </span>
          <span className="mt-0.5 block truncate text-[11px] leading-4 text-muted">
            {t("trackEta", { minutes: 12 })}
          </span>
        </span>
      </div>
      <div className="mt-2.5 grid grid-cols-4 gap-1">
        {Array.from({ length: STEPS }, (_, step) => (
          <span
            className={cn("h-1.5 rounded-full", step < COMPLETED_STEPS ? "bg-brand" : "bg-line")}
            key={step}
          />
        ))}
      </div>
    </div>
  );
}
