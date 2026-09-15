import { getTranslations } from "next-intl/server";

export async function HowItWorksClosingSection() {
  const t = await getTranslations("howItWorks.closing");

  return (
    <section className="py-14 sm:py-20">
      <div className="section-wrap max-w-2xl text-center">
        <p className="text-[15px] leading-[1.7] text-body">{t("body")}</p>
      </div>
    </section>
  );
}
