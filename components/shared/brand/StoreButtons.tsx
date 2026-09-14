import type { CSSProperties } from "react";

import { appStoreLinks } from "@/config/public-site";

/** "lg" is the in-page badge, "sm" is the condensed footer badge. */
type Size = "lg" | "sm";

const BUTTON: Record<Size, string> = {
  lg: "h-[46px] gap-[9px] px-4",
  sm: "h-8 gap-1.5 px-2.5",
};

const GLYPH: Record<Size, string> = {
  lg: "size-[21px]",
  sm: "size-3.5",
};

const CAPTION: Record<Size, string> = {
  lg: "text-[8px]",
  sm: "text-[5px]",
};

const NAME: Record<Size, string> = {
  lg: "text-[15px]",
  sm: "text-[10px]",
};

function AppleGlyph({ size }: { size: Size }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`${GLYPH[size]} flex-none`}
      aria-hidden="true"
    >
      <path
        fill="currentColor"
        d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.53 4.08zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"
      />
    </svg>
  );
}

function PlayGlyph({ size }: { size: Size }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`${GLYPH[size]} flex-none`}
      aria-hidden="true"
    >
      <path fill="#00a0ff" d="M3.6 2.2 13.4 12 3.6 21.8z" />
      <path fill="#00e07a" d="M3.6 2.2 17 9.9 13.4 12z" />
      <path fill="#ff3a44" d="M13.4 12 17 14.1 3.6 21.8z" />
      <path fill="#ffce00" d="M17 9.9 20.4 12 17 14.1 13.4 12z" />
    </svg>
  );
}

export function StoreButtons({
  size = "lg",
  className = "",
  style,
}: {
  size?: Size;
  className?: string;
  style?: CSSProperties;
}) {
  const button = `inline-flex items-center rounded-[7px] bg-[#050608] text-white transition-transform duration-200 hover:-translate-y-0.5 ${BUTTON[size]}`;

  return (
    <div
      className={`flex flex-wrap gap-3 sm:flex-nowrap ${className}`.trim()}
      style={style}
    >
      <a
        href={appStoreLinks.apple}
        target="_blank"
        rel="noreferrer"
        className={button}
      >
        <AppleGlyph size={size} />
        <span>
          <small
            className={`block leading-[1.1] tracking-[0.04em] ${CAPTION[size]}`}
          >
            Download on the
          </small>
          <strong
            className={`block font-heading font-semibold leading-[1.15] ${NAME[size]}`}
          >
            App Store
          </strong>
        </span>
      </a>
      <a
        href={appStoreLinks.google}
        target="_blank"
        rel="noreferrer"
        className={button}
      >
        <PlayGlyph size={size} />
        <span>
          <small
            className={`block leading-[1.1] tracking-[0.04em] ${CAPTION[size]}`}
          >
            GET IT ON
          </small>
          <strong
            className={`block font-heading font-semibold leading-[1.15] ${NAME[size]}`}
          >
            Google Play
          </strong>
        </span>
      </a>
    </div>
  );
}
