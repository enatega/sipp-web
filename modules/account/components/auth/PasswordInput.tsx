"use client";

import { useState, type InputHTMLAttributes } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useTranslations } from "next-intl";
import { fieldInput } from "@/modules/account/components/auth/styles";

interface Props extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  className?: string;
}

/**
 * Password field with an eye toggle pinned inside its end edge. Each field
 * keeps its own visibility so revealing one never exposes the other.
 */
export function PasswordInput({ className = "", disabled, ...props }: Props) {
  const t = useTranslations("auth");
  const [isVisible, setIsVisible] = useState(false);

  return (
    <span className="relative flex items-center">
      <input
        {...props}
        className={`${fieldInput} pe-12 ${className}`}
        disabled={disabled}
        type={isVisible ? "text" : "password"}
      />
      <button
        type="button"
        className="absolute end-2 grid size-8 place-items-center rounded-full text-muted transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-50"
        onClick={() => setIsVisible((visible) => !visible)}
        aria-label={isVisible ? t("hidePassword") : t("showPassword")}
        aria-pressed={isVisible}
        disabled={disabled}
      >
        {isVisible ? (
          <EyeOff aria-hidden="true" className="size-[18px]" />
        ) : (
          <Eye aria-hidden="true" className="size-[18px]" />
        )}
      </button>
    </span>
  );
}
