"use client";

import { useRef } from "react";

type OtpInputProps = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  length?: 4 | 6;
};

export function OtpInput({ value, onChange, disabled, length = 6 }: OtpInputProps) {
  const refs = useRef<Array<HTMLInputElement | null>>([]);
  const digits = Array.from({ length }, (_, index) => value[index] ?? "");

  const updateDigit = (index: number, raw: string) => {
    const digit = raw.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[index] = digit;
    onChange(next.join("").slice(0, length));
    if (digit && index < length - 1) refs.current[index + 1]?.focus();
  };

  return (
    <div
      className={`mt-1 grid gap-[7px] sm:gap-2.5 ${
        length === 4 ? "max-w-[320px] grid-cols-4" : "grid-cols-6"
      }`}
      role="group"
      aria-label="Verification code"
    >
      {digits.map((digit, index) => (
        <input
          key={index}
          className="aspect-square w-full rounded-full border border-[#e4e7eb] bg-[#f7f8fa] text-center font-heading text-[clamp(16px,1.5vw,21px)] font-semibold text-brand outline-none focus:border-brand focus:bg-white focus:shadow-[0_0_0_3px_rgba(183,24,47,0.1)]"
          ref={(node) => {
            refs.current[index] = node;
          }}
          value={digit}
          disabled={disabled}
          inputMode="numeric"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          aria-label={`Digit ${index + 1} of ${length}`}
          maxLength={1}
          onChange={(event) => updateDigit(index, event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Backspace" && !digit && index > 0) {
              refs.current[index - 1]?.focus();
            }
          }}
          onPaste={(event) => {
            const pasted = event.clipboardData
              .getData("text")
              .replace(/\D/g, "")
              .slice(0, length);
            if (!pasted) return;
            event.preventDefault();
            onChange(pasted);
            refs.current[Math.min(pasted.length, length) - 1]?.focus();
          }}
        />
      ))}
    </div>
  );
}
