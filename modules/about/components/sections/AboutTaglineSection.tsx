import { getTranslations } from "next-intl/server";

export async function AboutTaglineSection() {
  const t = await getTranslations("about.tagline");

  return (
    <section className="py-14 sm:py-20">
      <div className="section-wrap text-center">
        <p className="text-[11px] font-medium tracking-[0.18em] text-muted">
          {t("label").toUpperCase()}
        </p>
        <p className="mt-3.5 font-crest text-[30px] font-bold tracking-[0.04em] text-brand sm:text-[clamp(32px,4vw,46px)]">
          {t("value")}
        </p>
      </div>
    </section>
  );
}
