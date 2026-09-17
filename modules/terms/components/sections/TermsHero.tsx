import { getTranslations } from "next-intl/server";

export async function TermsHero() {
  const t = await getTranslations("terms");
  const hero = await getTranslations("terms.hero");

  return (
    <section id="top" className="bg-blush py-14 dark:bg-[linear-gradient(105deg,#111316_12%,#20171a_65%,#28191d)] sm:py-20">
      <div className="section-wrap text-center">
        <span className="inline-flex items-center rounded-full border border-brand/30 bg-surface/70 px-4 py-1.5 text-[11px] font-semibold tracking-[0.18em] text-brand backdrop-blur">
          {hero("eyebrow")}
        </span>
        <h1 className="mx-auto mt-6 max-w-2xl font-heading text-[30px] font-bold leading-[1.15] text-ink sm:text-[clamp(34px,5vw,48px)]">
          {hero("title")}
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-[15px] leading-[1.6] text-body">{hero("subtitle")}</p>
        <p className="mt-5 text-xs tracking-[0.08em] text-muted">{t("lastUpdated")}</p>
      </div>
    </section>
  );
}
