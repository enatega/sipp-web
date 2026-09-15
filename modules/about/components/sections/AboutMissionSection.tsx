import { getTranslations } from "next-intl/server";

export async function AboutMissionSection() {
  const t = await getTranslations("about.mission");
  const paragraphs = t.raw("paragraphs") as string[];

  return (
    <section className="bg-pinkbar py-14 sm:py-20">
      <div className="section-wrap max-w-3xl text-center">
        <h2 className="mb-5 font-heading text-[26px] font-bold text-ink sm:text-[32px]">
          {t("title")}
        </h2>
        <p className="mx-auto max-w-2xl text-lg font-semibold leading-[1.5] text-brand sm:text-xl">
          {t("statement")}
        </p>
        <div className="mx-auto mt-6 flex max-w-xl flex-col gap-3">
          {paragraphs.map((paragraph) => (
            <p key={paragraph} className="text-[15px] leading-[1.7] text-body">
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
