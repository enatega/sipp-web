/**
 * Tailwind class recipes shared across the auth screens.
 *
 * These are plain strings, not a CSS layer: keeping the repeated field /
 * button / link stacks in one place stops the five auth views from drifting
 * apart, while every value stays a Tailwind utility.
 */

export const fieldShell = "flex flex-col gap-2";

export const fieldLabel =
  "text-[clamp(13px,3.4vw,15px)] font-medium text-foreground md:text-[clamp(9px,0.75vw,13px)]";

export const fieldInput =
  "h-[clamp(48px,3vw,58px)] w-full rounded-[9px] border border-line bg-[var(--soft-surface)] px-4 text-[clamp(13px,3.4vw,15px)] text-foreground caret-brand outline-none transition-[border-color,box-shadow,background-color] duration-[180ms] placeholder:text-muted focus:border-[#cf5265] focus:bg-surface focus:shadow-[0_0_0_3px_rgba(183,24,47,0.11)] md:h-[clamp(36px,3vw,58px)] md:text-[clamp(10px,0.78vw,14px)]";

export const submitButton =
  "inline-flex min-h-[clamp(46px,2.8vw,53px)] w-full items-center justify-center rounded-[9px] bg-brand text-[clamp(13px,3.4vw,15px)] font-semibold text-white transition-[translate,background-color,box-shadow] duration-[180ms] hover:-translate-y-px hover:bg-brand-deep hover:shadow-[0_10px_24px_rgba(183,24,47,0.2)] disabled:translate-y-0 disabled:cursor-wait disabled:opacity-[0.64] disabled:shadow-none md:min-h-[clamp(35px,2.8vw,53px)] md:text-[clamp(10px,0.8vw,14px)]";

/** Brand-coloured inline link/button used for the secondary actions. */
export const inlineAction =
  "font-semibold text-brand underline decoration-transparent underline-offset-[3px] hover:decoration-current";

export const footNote =
  "text-center text-[clamp(11px,1vw,15px)] leading-[1.55] text-muted";

export const errorNote =
  "rounded-[10px] bg-[#fff0f2] px-3.5 py-[11px] text-[clamp(12px,0.9vw,13px)] leading-[1.45] text-[#9d1429]";

export const formShell = "flex flex-col gap-[clamp(12px,1.6vh,16px)]";

export const formHeading = "mb-[clamp(6px,1vh,10px)]";

export const formTitle =
  "text-[clamp(20px,5vw,25px)] font-bold leading-[1.25] tracking-[-0.02em] md:text-[clamp(21px,2vw,30px)]";

export const formSubtitle =
  "mt-1.5 text-[clamp(13px,3.4vw,15px)] leading-[1.5] text-muted [&_strong]:font-semibold [&_strong]:text-foreground md:text-[clamp(10px,0.8vw,14px)]";
