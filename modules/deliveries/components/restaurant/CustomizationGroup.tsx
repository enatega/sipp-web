import { AlertCircle } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { useAppCurrencyFormatter } from "@/lib/useAppCurrency";
import { cn } from "@/lib/utils";
import { CustomizationGroupBadge } from "./CustomizationGroupBadge";
import { CustomizationOptionRow } from "./CustomizationOptionRow";
import type { ProductCustomizationSection } from "../../types/restaurant";

interface Props {
  disabled?: boolean;
  hasError: boolean;
  onToggle: (groupId: string, optionId: string) => void;
  section: ProductCustomizationSection;
  selectedOptionIds: string[];
  setRef: (element: HTMLFieldSetElement | null) => void;
}

export function CustomizationGroup({
  disabled = false,
  hasError,
  onToggle,
  section,
  selectedOptionIds,
  setRef,
}: Props) {
  const t = useTranslations("deliveries.restaurant");
  const format = useFormatter();
  const formatAppCurrency = useAppCurrencyFormatter();
  const isRequired = section.required || section.minSelect > 0;
  const errorId = `customization-${section.groupId}-error`;

  const isComplete = selectedOptionIds.length >= Math.max(1, section.minSelect);
  const hasLimit = section.selectionType !== "single" && (section.maxSelect ?? 0) > 0;

  return (
    <fieldset
      aria-describedby={hasError ? errorId : undefined}
      aria-invalid={hasError}
      className={cn(
        "rounded-2xl border bg-card p-4 transition-[border-color,background-color]",
        hasError ? "border-brand bg-brand/5" : "border-line",
      )}
      ref={setRef}
      tabIndex={-1}
    >
      <legend className="sr-only">{section.name}</legend>
      <div aria-hidden="true" className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[15px] font-bold text-ink">{section.name}</p>
          {section.description || hasLimit ? (
            <p className="mt-0.5 text-xs text-muted">
              {section.description}
              {section.description && hasLimit ? " · " : null}
              {hasLimit ? t("chooseUpTo", { count: section.maxSelect ?? 0, selected: selectedOptionIds.length }) : null}
            </p>
          ) : null}
        </div>
        <CustomizationGroupBadge hasError={hasError} isComplete={isComplete} isRequired={isRequired} />
      </div>
      <div className="space-y-2">
        {section.options.map((option) => (
          <CustomizationOptionRow
            checked={selectedOptionIds.includes(option.optionId)}
            disabled={disabled}
            key={option.optionId}
            name={`customization-${section.groupId}`}
            onChange={() => onToggle(section.groupId, option.optionId)}
            price={option.price > 0 ? <span className="text-muted">+ {formatAppCurrency(format, option.price)}</span> : null}
            title={option.title}
            type={section.selectionType === "single" ? "radio" : "checkbox"}
          />
        ))}
      </div>
      {hasError ? (
        <p className="mt-3 flex items-start gap-1.5 text-xs font-semibold text-brand" id={errorId} role="alert">
          <AlertCircle aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" />
          {t("requiredGroupError", { count: Math.max(1, section.minSelect) })}
        </p>
      ) : null}
    </fieldset>
  );
}
