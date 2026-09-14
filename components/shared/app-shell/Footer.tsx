import { Logo } from "@/components/shared/brand/Logo";
import { StoreButtons } from "@/components/shared/brand/StoreButtons";
import { footerColumns } from "@/config/public-site";

const SOCIALS = [
  ["X", "M4 4l12 12M16 4L4 16"],
  ["Facebook", "M12.5 5H14V2.7h-2c-1.9 0-3 1.2-3 3.1V8H7v2.3h2V18h2.4v-7.7h2L15.7 8h-2.3V6.2c0-.8.4-1.2 1.1-1.2z"],
  ["LinkedIn", "M4 8h2.4v9H4zM5.2 4.2a1.4 1.4 0 1 1 0 2.8 1.4 1.4 0 0 1 0-2.8zM9 8h2.3v1.2A2.7 2.7 0 0 1 13.6 8C15.6 8 17 9.3 17 11.9V17h-2.4v-4.6c0-1.3-.5-2.1-1.6-2.1s-1.7.8-1.7 2.1V17H9z"],
] as const;

export function Footer() {
  return (
    <footer className="bg-surface pb-[22px] pt-[54px]">
      <div className="section-wrap">
        <div className="grid grid-cols-1 gap-[30px] sm:grid-cols-2 md:grid-cols-[2fr_1fr_1.2fr_1fr] md:gap-10">
          <div className="col-span-full md:col-span-1">
            <Logo className="[&_img]:h-14 md:[&_img]:h-20" />
            <p className="my-4 max-w-[250px] text-xs leading-[1.5] text-body">
              Local delivery for food, groceries, drinks, and everyday
              essentials across Costa Rica&apos;s coastal communities.
            </p>
            <div className="flex gap-2">
              {["Santa Teresa", "Playa Carmen"].map((domain) => (
                <span
                  key={domain}
                  className="rounded-lg border border-line px-2.5 py-[5px] text-[10px] text-muted"
                >
                  {domain}
                </span>
              ))}
            </div>
          </div>
          {footerColumns.map(({ title, links }) => (
            <div className="flex flex-col gap-[11px]" key={title}>
              <b className="text-[11px] tracking-[0.14em] text-ink">{title}</b>
              {links.map((link) => (
                <a
                  key={link}
                  href="#top"
                  className="text-xs text-body hover:text-brand"
                >
                  {link}
                </a>
              ))}
            </div>
          ))}
        </div>

        <div className="mt-[34px] flex flex-col items-start justify-between gap-5 border-t border-line pt-[18px] text-[11px] text-muted md:flex-row md:items-center">
          <span>&copy; 2026 SIPP &middot; All rights reserved</span>
          <span className="inline-flex items-center gap-3">
            <small className="text-[10px] tracking-[0.12em]">DOWNLOAD APP</small>
            <StoreButtons size="sm" />
          </span>
          <span className="inline-flex gap-2.5">
            {SOCIALS.map(([label, d]) => (
              <a
                key={label}
                href="#top"
                aria-label={label}
                className="grid size-[26px] place-items-center rounded-full border border-line text-body"
              >
                <svg viewBox="0 0 20 20" aria-hidden="true" className="size-[13px]">
                  <path
                    d={d}
                    fill={label === "X" ? "none" : "currentColor"}
                    stroke={label === "X" ? "currentColor" : "none"}
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                </svg>
              </a>
            ))}
          </span>
        </div>
      </div>
    </footer>
  );
}
