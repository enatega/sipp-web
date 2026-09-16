import { Logo } from "@/components/shared/brand/Logo";
import { StoreButtons } from "@/components/shared/brand/StoreButtons";
import { footerColumns } from "@/config/public-site";

const FOOTER_LINK_HREFS: Record<string, string> = {
  "About SIPP": "/about",
  "Partner with us": "/partners",
  "How it works": "/how-it-works",
  "Terms & Condition": "/terms",
  "Contact Us": "/contact",
};

const CONTACT_DETAILS = {
  address: "Santa Teresa, Provincia de Puntarenas, Puntarenas, Costa Rica",
  email: "support@sippdelivery.com",
  phone: "+50670445484",
};

const SOCIALS = [
  {
    label: "Facebook",
    url: "https://www.facebook.com/people/SIPP-FoodDrinksMore/61571445882236/",
    icon: (
      <path
        d="M12.5 5H14V2.7h-2c-1.9 0-3 1.2-3 3.1V8H7v2.3h2V18h2.4v-7.7h2L15.7 8h-2.3V6.2c0-.8.4-1.2 1.1-1.2z"
        fill="currentColor"
      />
    ),
  },
  {
    label: "Instagram",
    url: "https://www.instagram.com/sippdelivery/",
    icon: (
      <>
        <rect x="3.5" y="3.5" width="13" height="13" rx="4" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="10" cy="10" r="3.4" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="13.6" cy="6.4" r="0.9" fill="currentColor" />
      </>
    ),
  },
  {
    label: "LinkedIn",
    url: "https://www.linkedin.com/login/?session_redirect=https%3A%2F%2Fwww.linkedin.com%2Fcompany%2Fsipp-delivery%2Fabout%2F%3FviewAsMember%3Dtrue",
    icon: (
      <path
        d="M4 8h2.4v9H4zM5.2 4.2a1.4 1.4 0 1 1 0 2.8 1.4 1.4 0 0 1 0-2.8zM9 8h2.3v1.2A2.7 2.7 0 0 1 13.6 8C15.6 8 17 9.3 17 11.9V17h-2.4v-4.6c0-1.3-.5-2.1-1.6-2.1s-1.7.8-1.7 2.1V17H9z"
        fill="currentColor"
      />
    ),
  },
] as const;

const [companyColumn, legalColumn] = footerColumns;

export function Footer() {
  return (
    <footer className="bg-[#F6F6F8] pb-[22px] pt-[54px] dark:bg-surface">
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

          <div className="flex flex-col gap-[11px]">
            <b className="text-[11px] tracking-[0.14em] text-ink">{companyColumn.title}</b>
            {companyColumn.links.map((link) => (
              <a key={link} href={FOOTER_LINK_HREFS[link] ?? "#top"} className="text-xs text-body hover:text-brand">
                {link}
              </a>
            ))}
          </div>

          <div className="flex flex-col gap-[11px]">
            <b className="text-[11px] tracking-[0.14em] text-ink">GET IN TOUCH</b>
            <span className="text-xs leading-[1.5] text-body">{CONTACT_DETAILS.address}</span>
            <span className="inline-flex items-start gap-1.5 text-xs text-body">
              <svg viewBox="0 0 20 20" aria-hidden="true" className="mt-0.5 size-3 shrink-0">
                <path
                  d="M3.5 5.5h13a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1h-13a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.4"
                />
                <path d="M3.8 6.2l6.2 4.6 6.2-4.6" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
              {CONTACT_DETAILS.email}
            </span>
            <span className="inline-flex items-start gap-1.5 text-xs text-body">
              <svg viewBox="0 0 20 20" aria-hidden="true" className="mt-0.5 size-3 shrink-0">
                <path
                  d="M5 3.5c-1 0-1.5.6-1.5 1.6 0 6.4 5 11.4 11.4 11.4 1 0 1.6-.5 1.6-1.5v-1.7c0-.5-.3-.8-.8-.9l-2.4-.5c-.4-.1-.8.1-1 .4l-.6.9a8.6 8.6 0 0 1-4.4-4.4l.9-.6c.3-.2.5-.6.4-1l-.5-2.4c-.1-.5-.4-.8-.9-.8H5z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinejoin="round"
                />
              </svg>
              {CONTACT_DETAILS.phone}
            </span>
          </div>

          <div className="flex flex-col gap-[11px]">
            <b className="text-[11px] tracking-[0.14em] text-ink">{legalColumn.title}</b>
            {legalColumn.links.map((link) => (
              <a key={link} href={FOOTER_LINK_HREFS[link] ?? "#top"} className="text-xs text-body hover:text-brand">
                {link}
              </a>
            ))}
          </div>
        </div>

        <div className="mt-[34px] flex flex-col items-start justify-between gap-5 border-t border-line pt-[18px] text-[11px] text-muted md:flex-row md:items-center">
          <span>&copy; 2026 SIPP &middot; All rights reserved</span>
          <span className="inline-flex items-center gap-3">
            <small className="text-[10px] tracking-[0.12em]">DOWNLOAD APP</small>
            <StoreButtons size="sm" />
          </span>
          <span className="inline-flex gap-2.5">
            {SOCIALS.map(({ label, url, icon }) => (
              <a
                key={label}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="grid size-[26px] place-items-center rounded-full border border-line text-body"
              >
                <svg viewBox="0 0 20 20" aria-hidden="true" className="size-[13px]">
                  {icon}
                </svg>
              </a>
            ))}
          </span>
        </div>
      </div>
    </footer>
  );
}
