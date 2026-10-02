import { Globe } from "lucide-react";
import type { Locale } from "@/i18n/config";
import { cn } from "@/lib/utils";

interface Props {
  locale: Locale;
  className?: string;
}

/** Round flag for a locale; Arabic spans many countries, so it uses a globe. */
export function LocaleFlag({ locale, className }: Props) {
  const frame = cn(
    "grid size-5 shrink-0 place-items-center overflow-hidden rounded-full ring-1 ring-line",
    className,
  );

  if (locale === "ar") {
    return (
      <span aria-hidden="true" className={cn(frame, "bg-brand/15 text-brand")}>
        <Globe className="size-3.5" />
      </span>
    );
  }

  return (
    <span aria-hidden="true" className={frame}>
      <svg className="size-full" preserveAspectRatio="none" viewBox="0 0 60 30">
        {locale === "en" && (
          <>
            <rect fill="#012169" height="30" width="60" />
            <path d="M0 0 L60 30 M60 0 L0 30" stroke="#fff" strokeWidth="6" />
            <path d="M0 0 L60 30 M60 0 L0 30" stroke="#c8102e" strokeWidth="2.5" />
            <path d="M30 0 V30 M0 15 H60" stroke="#fff" strokeWidth="10" />
            <path d="M30 0 V30 M0 15 H60" stroke="#c8102e" strokeWidth="6" />
          </>
        )}
        {locale === "de" && (
          <>
            <rect fill="#000" height="10" width="60" />
            <rect fill="#dd0000" height="10" width="60" y="10" />
            <rect fill="#ffce00" height="10" width="60" y="20" />
          </>
        )}
        {locale === "es" && (
          <>
            <rect fill="#aa151b" height="30" width="60" />
            <rect fill="#f1bf00" height="15" width="60" y="7.5" />
          </>
        )}
        {locale === "fr" && (
          <>
            <rect fill="#002654" height="30" width="20" />
            <rect fill="#fff" height="30" width="20" x="20" />
            <rect fill="#ce1126" height="30" width="20" x="40" />
          </>
        )}
      </svg>
    </span>
  );
}
