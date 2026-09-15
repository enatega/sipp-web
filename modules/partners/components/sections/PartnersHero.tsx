import { getTranslations } from "next-intl/server";

export async function PartnersHero() {
  const t = await getTranslations("partners.hero");

  return (
    <section
      id="top"
      className="relative overflow-hidden bg-blush py-16 dark:bg-[linear-gradient(105deg,#111316_12%,#20171a_65%,#28191d)] sm:py-24"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-60 dark:opacity-40"
        style={{
          background:
            "radial-gradient(60% 60% at 85% 15%, color-mix(in srgb, var(--color-brand) 22%, transparent), transparent), radial-gradient(45% 45% at 8% 90%, color-mix(in srgb, var(--color-brand) 16%, transparent), transparent)",
        }}
      />
      <div className="section-wrap relative text-center">
        <span className="inline-flex items-center rounded-full border border-brand/30 bg-surface/70 px-4 py-1.5 text-[11px] font-semibold tracking-[0.18em] text-brand backdrop-blur">
          {t("eyebrow")}
        </span>
        <h1 className="mx-auto mt-6 max-w-3xl font-heading text-[28px] font-bold leading-[1.25] text-ink sm:text-[clamp(32px,4.4vw,48px)]">
          {t("title")}
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-[15px] leading-[1.6] text-body">
          {t("subtitle")}
        </p>
        <p className="mx-auto mt-2 max-w-xl text-base font-semibold text-brand">
          {t("highlight")}
        </p>
      </div>
    </section>
  );
}
