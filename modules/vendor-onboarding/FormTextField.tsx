"use client";

import { useId, useState } from "react";
import { Eye, EyeOff, type LucideIcon } from "lucide-react";

interface Props {
  name: string;
  label: string;
  placeholder: string;
  value: string;
  type?: "text" | "email" | "tel" | "password";
  autoComplete?: string;
  error?: string;
  icon: LucideIcon;
  showPasswordLabel?: string;
  hidePasswordLabel?: string;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  onBlur: React.FocusEventHandler<HTMLInputElement>;
}

export function FormTextField({
  name,
  label,
  placeholder,
  value,
  type = "text",
  autoComplete,
  error,
  icon: FieldIcon,
  showPasswordLabel,
  hidePasswordLabel,
  onChange,
  onBlur,
}: Props) {
  const id = useId();
  const errorId = `${id}-error`;
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const isPassword = type === "password";
  const resolvedType = isPassword && isPasswordVisible ? "text" : type;

  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-[13px] font-bold text-ink">
        {label}
      </label>
      <div className="relative">
        <FieldIcon
          aria-hidden="true"
          className="pointer-events-none absolute left-4 top-1/2 size-[18px] -translate-y-1/2 text-muted"
          strokeWidth={1.8}
        />
        <input
          id={id}
          name={name}
          type={resolvedType}
          autoComplete={autoComplete}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          className={`h-14 w-full rounded-[14px] border bg-[var(--soft-surface)] pl-11 text-[15px] font-medium text-ink outline-none transition-[border-color,box-shadow,background-color] placeholder:font-normal placeholder:text-muted hover:bg-surface focus:bg-surface focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--color-brand)_12%,transparent)] ${
            isPassword ? "pr-12" : "pr-4"
          } ${error ? "border-danger" : "border-line focus:border-brand"}`}
        />
        {isPassword ? (
          <button
            type="button"
            onClick={() => setIsPasswordVisible((current) => !current)}
            aria-label={isPasswordVisible ? hidePasswordLabel : showPasswordLabel}
            className="absolute right-2.5 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-full text-muted transition-colors hover:bg-danger-soft hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-brand"
          >
            {isPasswordVisible ? <EyeOff className="size-[18px]" /> : <Eye className="size-[18px]" />}
          </button>
        ) : null}
      </div>
      {error ? (
        <p id={errorId} className="mt-1.5 text-xs font-medium text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}
