import type { ReactNode } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  checked: boolean;
  disabled: boolean;
  name: string;
  onChange: () => void;
  price: ReactNode;
  title: string;
  type: "radio" | "checkbox";
}

/** Selectable option tile backed by a native radio/checkbox for keyboard and screen-reader support. */
export function CustomizationOptionRow({ checked, disabled, name, onChange, price, title, type }: Props) {
  return (
    <label
      className={cn(
        "flex min-h-12 items-center gap-3 rounded-xl border px-3.5 py-2.5 text-sm transition-[background-color,border-color,box-shadow] has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand has-[:focus-visible]:ring-offset-1 has-[:focus-visible]:ring-offset-card",
        checked ? "border-brand bg-brand/8" : "border-line bg-surface",
        disabled ? "cursor-not-allowed opacity-55" : checked ? "cursor-pointer" : "cursor-pointer hover:border-brand/40",
      )}
    >
      <input
        checked={checked}
        className="peer sr-only"
        disabled={disabled}
        name={name}
        onChange={onChange}
        type={type}
      />
      <span
        aria-hidden="true"
        className={cn(
          "grid size-5 shrink-0 place-items-center border-2 transition-colors",
          type === "radio" ? "rounded-full" : "rounded-md",
          checked ? "border-brand bg-brand text-ink" : "border-line bg-card",
        )}
      >
        {checked ? (
          type === "radio" ? <span className="size-2 rounded-full bg-ink" /> : <Check className="size-3.5" strokeWidth={3} />
        ) : null}
      </span>
      <span className={cn("min-w-0 flex-1", checked ? "font-semibold text-ink" : "text-ink")}>{title}</span>
      <span className="shrink-0 text-xs tabular-nums">{price}</span>
    </label>
  );
}
