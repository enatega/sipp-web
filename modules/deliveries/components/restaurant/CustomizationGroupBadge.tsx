import { Check } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

interface Props {
  hasError?: boolean;
  isComplete: boolean;
  isRequired: boolean;
}

/** Required / Optional pill that turns into a "Done" check once a required group is satisfied. */
export function CustomizationGroupBadge({ hasError = false, isComplete, isRequired }: Props) {
  const t = useTranslations("deliveries.restaurant");

  if (isRequired && isComplete && !hasError) {
    return (
      <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-success-soft px-2.5 py-1 text-[11px] font-bold text-success">
        <Check aria-hidden="true" className="size-3" />
        {t("groupComplete")}
      </span>
    );
  }

  return (
    <span
      className={cn(
        "shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold",
        isRequired
          ? hasError ? "bg-brand text-ink" : "bg-brand/12 text-brand"
          : "bg-[var(--soft-surface)] text-muted",
      )}
    >
      {isRequired ? t("required") : t("optional")}
    </span>
  );
}
