"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Check, ChevronDown, MapPinned } from "lucide-react";
import type { VendorZone } from "./types";

interface Props {
  label: string;
  placeholder: string;
  value: string;
  options: VendorZone[];
  error?: string;
  disabled?: boolean;
  onChange: (value: string) => void;
  onBlur: () => void;
}

export function ZoneSelectField({
  label,
  placeholder,
  value,
  options,
  error,
  disabled,
  onChange,
  onBlur,
}: Props) {
  const id = useId();
  const listboxId = `${id}-listbox`;
  const errorId = `${id}-error`;
  const rootRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const selectedIndex = options.findIndex((option) => option.id === value);
  const selectedOption = options[selectedIndex];

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
        onBlur();
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [isOpen, onBlur]);

  const open = () => {
    if (disabled) return;
    setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0);
    setIsOpen(true);
  };

  return (
    <div ref={rootRef}>
      <label id={`${id}-label`} className="mb-2 block text-[13px] font-bold text-ink">
        {label}
      </label>
      <div className="relative">
        <button
          id={id}
          type="button"
          role="combobox"
          aria-labelledby={`${id}-label ${id}-value`}
          aria-controls={listboxId}
          aria-expanded={isOpen}
          aria-activedescendant={isOpen && options[activeIndex] ? `${id}-option-${activeIndex}` : undefined}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          disabled={disabled}
          onClick={() => (isOpen ? setIsOpen(false) : open())}
          onBlur={(event) => {
            if (!rootRef.current?.contains(event.relatedTarget)) {
              setIsOpen(false);
              onBlur();
            }
          }}
          onKeyDown={(event) => {
            if (disabled) return;
            if (event.key === "ArrowDown" || event.key === "ArrowUp") {
              event.preventDefault();
              if (!isOpen) {
                open();
                return;
              }
              const direction = event.key === "ArrowDown" ? 1 : -1;
              if (options.length > 0) {
                setActiveIndex((current) => (current + direction + options.length) % options.length);
              }
            }
            if (event.key === "Escape") {
              setIsOpen(false);
            }
            if ((event.key === "Enter" || event.key === " ") && isOpen && options[activeIndex]) {
              event.preventDefault();
              onChange(options[activeIndex].id);
              setIsOpen(false);
              onBlur();
            }
          }}
          className={`flex h-14 w-full items-center rounded-[14px] border bg-[var(--soft-surface)] pl-4 pr-3 text-left text-[15px] font-medium outline-none transition-[border-color,box-shadow,background-color] hover:bg-surface focus:bg-surface focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--color-brand)_12%,transparent)] disabled:cursor-wait disabled:opacity-60 ${
            error ? "border-danger" : "border-line focus:border-brand"
          }`}
        >
          <MapPinned className="mr-3 size-[18px] flex-none text-muted" strokeWidth={1.8} />
          <span id={`${id}-value`} className={`min-w-0 flex-1 truncate ${selectedOption ? "text-ink" : "text-muted"}`}>
            {selectedOption?.title ?? placeholder}
          </span>
          <span className="ml-3 grid size-8 flex-none place-items-center rounded-full bg-surface text-muted shadow-card">
            <ChevronDown className={`size-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
          </span>
        </button>

        {isOpen ? (
          <div
            id={listboxId}
            role="listbox"
            aria-labelledby={`${id}-label`}
            className="absolute z-30 mt-2 max-h-64 w-full overflow-y-auto rounded-[14px] bg-surface p-1.5 shadow-card"
          >
            {options.map((option, index) => (
              <div
                id={`${id}-option-${index}`}
                key={option.id}
                role="option"
                aria-selected={option.id === value}
                onMouseEnter={() => setActiveIndex(index)}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  onChange(option.id);
                  setIsOpen(false);
                  onBlur();
                }}
                className={`flex min-h-11 cursor-pointer items-center justify-between rounded-[10px] px-3 text-sm font-medium outline-none transition-colors ${
                  index === activeIndex ? "bg-danger-soft text-brand" : "text-ink hover:bg-[var(--soft-surface)]"
                }`}
              >
                <span>{option.title}</span>
                {option.id === value ? <Check className="size-4" strokeWidth={2.2} /> : null}
              </div>
            ))}
          </div>
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
