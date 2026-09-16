"use client";

import { useId } from "react";

interface Props {
  name: string;
  label: string;
  placeholder: string;
  value: string;
  error?: string;
  rows?: number;
  onChange: React.ChangeEventHandler<HTMLTextAreaElement>;
  onBlur: React.FocusEventHandler<HTMLTextAreaElement>;
}

export function FormTextAreaField({ name, label, placeholder, value, error, rows = 5, onChange, onBlur }: Props) {
  const id = useId();
  const errorId = `${id}-error`;

  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-[13px] font-bold text-ink">
        {label}
      </label>
      <textarea
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        rows={rows}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className={`w-full resize-none rounded-[14px] border bg-[var(--soft-surface)] px-4 py-3 text-[15px] font-medium text-ink outline-none transition-[border-color,box-shadow,background-color] placeholder:font-normal placeholder:text-muted hover:bg-surface focus:bg-surface focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--color-brand)_12%,transparent)] ${error ? "border-danger" : "border-line focus:border-brand"}`}
      />
      {error ? (
        <p id={errorId} className="mt-1.5 text-xs font-medium text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}
