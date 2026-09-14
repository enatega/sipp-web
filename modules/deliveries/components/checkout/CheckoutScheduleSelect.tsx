"use client";

import { useEffect, useId, useRef, useState } from "react";
import { CalendarClock, Check, ChevronDown, LoaderCircle } from "lucide-react";

interface ScheduleOption {
  value: string;
  label: string;
}

interface Props {
  label: string;
  placeholder: string;
  loadingLabel: string;
  value: string;
  options: ScheduleOption[];
  isLoading: boolean;
  error?: string;
  onChange: (value: string) => void;
  onBlur: () => void;
}

export function CheckoutScheduleSelect({
  label,
  placeholder,
  loadingLabel,
  value,
  options,
  isLoading,
  error,
  onChange,
  onBlur,
}: Props) {
  const id = useId();
  const listboxId = `${id}-listbox`;
  const errorId = `${id}-error`;
  const rootRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const selectedIndex = options.findIndex((option) => option.value === value);
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

  function open() {
    if (isLoading || options.length === 0) return;
    setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0);
    setIsOpen(true);
  }

  function choose(option: ScheduleOption) {
    onChange(option.value);
    setIsOpen(false);
    onBlur();
  }

  return (
    <div ref={rootRef}>
      <label className="mb-2 block text-xs font-semibold text-ink" id={`${id}-label`}>
        {label}
      </label>
      <div className="relative">
        <button
          aria-activedescendant={isOpen && options[activeIndex] ? `${id}-option-${activeIndex}` : undefined}
          aria-controls={listboxId}
          aria-describedby={error ? errorId : undefined}
          aria-expanded={isOpen}
          aria-invalid={Boolean(error)}
          aria-labelledby={`${id}-label ${id}-value`}
          className={`flex min-h-14 w-full items-center rounded-[14px] border bg-[var(--soft-surface)] pl-4 pr-3 text-left text-sm font-medium outline-none transition-[border-color,box-shadow,background-color] hover:bg-surface focus:bg-surface focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--color-brand)_12%,transparent)] disabled:cursor-wait disabled:opacity-60 ${error ? "border-danger" : "border-line focus:border-brand"}`}
          disabled={isLoading || options.length === 0}
          id={id}
          onBlur={(event) => {
            if (!rootRef.current?.contains(event.relatedTarget)) {
              setIsOpen(false);
              onBlur();
            }
          }}
          onClick={() => (isOpen ? setIsOpen(false) : open())}
          onKeyDown={(event) => {
            if (event.key === "ArrowDown" || event.key === "ArrowUp") {
              event.preventDefault();
              if (!isOpen) return open();
              const direction = event.key === "ArrowDown" ? 1 : -1;
              setActiveIndex((current) => (current + direction + options.length) % options.length);
            }
            if (event.key === "Escape") setIsOpen(false);
            if ((event.key === "Enter" || event.key === " ") && isOpen && options[activeIndex]) {
              event.preventDefault();
              choose(options[activeIndex]);
            }
          }}
          role="combobox"
          type="button"
        >
          {isLoading ? <LoaderCircle aria-hidden="true" className="mr-3 size-[18px] animate-spin text-brand" /> : <CalendarClock aria-hidden="true" className="mr-3 size-[18px] text-muted" strokeWidth={1.8} />}
          <span className={`min-w-0 flex-1 truncate ${selectedOption ? "text-ink" : "text-muted"}`} id={`${id}-value`}>
            {isLoading ? loadingLabel : selectedOption?.label ?? placeholder}
          </span>
          <span className="ml-3 grid size-8 shrink-0 place-items-center rounded-full bg-surface text-muted shadow-card">
            <ChevronDown aria-hidden="true" className={`size-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
          </span>
        </button>

        {isOpen ? (
          <div aria-labelledby={`${id}-label`} className="absolute z-30 mt-2 max-h-72 w-full overflow-y-auto rounded-[14px] bg-surface p-1.5 shadow-pop" id={listboxId} role="listbox">
            {options.map((option, index) => (
              <div
                aria-selected={option.value === value}
                className={`flex min-h-11 cursor-pointer items-center justify-between rounded-[10px] px-3 text-sm font-medium outline-none transition-colors ${index === activeIndex ? "bg-danger-soft text-brand" : "text-ink hover:bg-[var(--soft-surface)]"}`}
                id={`${id}-option-${index}`}
                key={option.value}
                onClick={() => choose(option)}
                onMouseDown={(event) => event.preventDefault()}
                onMouseEnter={() => setActiveIndex(index)}
                role="option"
              >
                <span>{option.label}</span>
                {option.value === value ? <Check aria-hidden="true" className="size-4" strokeWidth={2.2} /> : null}
              </div>
            ))}
          </div>
        ) : null}
      </div>
      {error ? <p className="mt-1.5 text-xs font-medium text-danger" id={errorId} role="alert">{error}</p> : null}
    </div>
  );
}
