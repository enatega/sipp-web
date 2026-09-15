import { Mail, Phone } from "lucide-react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

export async function PartnersCtaSection() {
  const t = await getTranslations("partners.cta");
  const phone = t("phone");
  const email = t("email");

  return (
    <section className="bg-surface py-14 sm:py-20">
      <div className="section-wrap max-w-2xl text-center">
        <h2 className="mb-8 font-heading text-2xl font-bold text-ink sm:text-[28px]">
          {t("title")}
        </h2>

        <Link
          href="/become-a-vendor"
          className="inline-flex items-center justify-center rounded-full bg-brand px-8 py-3.5 text-sm font-semibold text-white shadow-card transition hover:opacity-90"
        >
          {t("applyButton")}
        </Link>

        <p className="mb-3 mt-10 text-[11px] font-semibold tracking-[0.14em] text-muted">
          {t("contactLabel").toUpperCase()}
        </p>
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a
            href={`tel:${phone.replace(/[^+\d]/g, "")}`}
            className="inline-flex items-center gap-2 rounded-full border border-line bg-card px-5 py-2.5 text-sm text-ink hover:border-brand hover:text-brand"
          >
            <Phone aria-hidden="true" className="size-4" />
            {phone}
          </a>
          <a
            href={`mailto:${email}`}
            className="inline-flex items-center gap-2 rounded-full border border-line bg-card px-5 py-2.5 text-sm text-ink hover:border-brand hover:text-brand"
          >
            <Mail aria-hidden="true" className="size-4" />
            {email}
          </a>
        </div>
      </div>
    </section>
  );
}
