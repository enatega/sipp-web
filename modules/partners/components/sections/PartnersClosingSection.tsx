import { getTranslations } from "next-intl/server";

export async function PartnersClosingSection() {
  const t = await getTranslations("partners.closing");

  return (
    <section className="py-14 sm:py-20">
      <div className="section-wrap text-center">
        <p className="font-crest text-[30px] font-bold tracking-[0.04em] text-brand sm:text-[clamp(32px,4vw,46px)]">
          {t("title")}
        </p>
        <p className="mt-3.5 text-[15px] leading-[1.6] text-body">{t("subtitle")}</p>
      </div>
    </section>
  );
}
