"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { countries, flagFor, type Country } from "@/modules/account/data/countries";

type CountrySelectProps = {
  value: Country;
  onChange: (country: Country) => void;
  disabled?: boolean;
};

export function CountrySelect({ value, onChange, disabled }: CountrySelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const dismiss = () => {
    setQuery("");
    setOpen(false);
  };

  useEffect(() => {
    if (!open) return;
    searchRef.current?.focus();
    const close = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) dismiss();
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") dismiss();
    };
    window.addEventListener("pointerdown", close);
    window.addEventListener("keydown", escape);
    return () => {
      window.removeEventListener("pointerdown", close);
      window.removeEventListener("keydown", escape);
    };
  }, [open]);

  const matches = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return countries;
    return countries.filter(
      (country) =>
        country.name.toLowerCase().includes(term) ||
        country.iso.toLowerCase().includes(term) ||
        country.dial.includes(term.replace(/^\+/, "")),
    );
  }, [query]);

  return (
    <div className="relative flex self-stretch" ref={rootRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => (open ? dismiss() : setOpen(true))}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Country code, currently ${value.name} +${value.dial}`}
        className="flex h-full items-center gap-1.5 border-r border-[#e6e8ec] px-3 text-[clamp(13px,1.1vw,16px)] font-medium text-[#35373c] disabled:opacity-60"
      >
        <span aria-hidden="true" className="text-[1.15em] leading-none">
          {flagFor(value.iso)}
        </span>
        <span>+{value.dial}</span>
        <svg
          viewBox="0 0 20 20"
          aria-hidden="true"
          className="w-3 fill-none stroke-current stroke-[1.8] [stroke-linecap:round] [stroke-linejoin:round]"
        >
          <path d="m5.5 7.5 4.5 4.5 4.5-4.5" />
        </svg>
      </button>

      {open ? (
        <div className="absolute left-0 top-[calc(100%+8px)] z-10 w-[min(19rem,80vw)] overflow-hidden rounded-xl border border-[#eceef1] bg-white shadow-[0_18px_45px_rgba(31,19,22,0.15)]">
          <div className="p-2">
            <input
              ref={searchRef}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search country or code"
              aria-label="Search countries"
              className="h-10 w-full rounded-lg border border-[#eceef1] bg-[#fbfbfc] px-3 text-sm text-[#181a1e] outline-none placeholder:text-[#9a9da4] focus:border-[#cf5265] focus:bg-white"
            />
          </div>
          <ul role="listbox" className="max-h-64 overflow-y-auto pb-2">
            {matches.map((country) => (
              <li key={country.iso}>
                <button
                  type="button"
                  role="option"
                  aria-selected={country.iso === value.iso}
                  onClick={() => {
                    onChange(country);
                    dismiss();
                  }}
                  className={`flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm hover:bg-[#fff1f3] ${
                    country.iso === value.iso
                      ? "bg-[#fff1f3] font-semibold text-brand"
                      : "text-[#33353a]"
                  }`}
                >
                  <span aria-hidden="true" className="text-base leading-none">
                    {flagFor(country.iso)}
                  </span>
                  <span className="min-w-0 flex-1 truncate">{country.name}</span>
                  <span className="text-[#8a8d94]">+{country.dial}</span>
                </button>
              </li>
            ))}
            {matches.length === 0 ? (
              <li className="px-3 py-4 text-center text-sm text-[#8a8d94]">
                No countries match “{query}”.
              </li>
            ) : null}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
