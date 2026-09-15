import { getTranslations } from "next-intl/server";

export async function AboutLocalSection() {
  const t = await getTranslations("about.local");
  const paragraphs = t.raw("paragraphs") as string[];

  return (
    <section className="py-14 sm:py-20">
      <div className="section-wrap max-w-3xl">
        <h2 className="mb-6 font-heading text-[26px] font-bold text-ink sm:text-[32px]">
          {t("title")}
        </h2>
        <div className="flex flex-col gap-4">
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
