import { AlertCircle } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
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
  const isRequired = section.required || section.minSelect > 0;
  const errorId = `customization-${section.groupId}-error`;

  return (
    <fieldset
      aria-describedby={hasError ? errorId : undefined}
      aria-invalid={hasError}
      className={cn(
        "rounded-xl border p-3.5 transition",
        hasError ? "border-brand bg-brand/5" : "border-line",
      )}
      ref={setRef}
      tabIndex={-1}
    >
      <legend className="w-full px-0 text-sm font-bold text-ink">
        <span className="flex items-center justify-between gap-3">
          {section.name}
          <small className={cn("font-medium", isRequired ? "text-brand" : "text-muted")}>
            {isRequired ? t("required") : t("optional")}
          </small>
        </span>
      </legend>
      {section.description ? (
        <p className="mb-2 text-xs text-muted">{section.description}</p>
      ) : null}
      <div className="divide-y divide-line">
        {section.options.map((option) => {
          const checked = selectedOptionIds.includes(option.optionId);
          return (
            <label
              className={cn(
                "flex items-center gap-3 py-2.5 text-xs text-body",
                disabled ? "cursor-not-allowed opacity-55" : "cursor-pointer",
              )}
              key={option.optionId}
            >
              <input
                checked={checked}
                className="size-4 accent-[var(--color-brand)]"
                disabled={disabled}
                name={`customization-${section.groupId}`}
                onChange={() => onToggle(section.groupId, option.optionId)}
                type={section.selectionType === "single" ? "radio" : "checkbox"}
              />
              <span className="min-w-0 flex-1 text-ink">{option.title}</span>
              {option.price > 0 ? (
                <span className="shrink-0 text-muted">
                  + {format.number(option.price, { style: "currency", currency: "INR" })}
                </span>
              ) : null}
            </label>
          );
        })}
      </div>
      {hasError ? (
        <p className="mt-2 flex items-start gap-1.5 text-[11px] font-semibold text-brand" id={errorId} role="alert">
          <AlertCircle aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" />
          {t("requiredGroupError", { count: Math.max(1, section.minSelect) })}
        </p>
      ) : null}
    </fieldset>
  );
}
