import { getTranslations } from "next-intl/server";

export async function TermsPreambleSection() {
  const t = await getTranslations("terms.preamble");
  const paragraphs = t.raw("paragraphs") as string[];

  return (
    <section className="py-14 sm:py-16">
      <div className="section-wrap max-w-3xl">
        <h2 className="mb-6 font-heading text-[24px] font-bold text-ink sm:text-[28px]">{t("heading")}</h2>
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
