import { getTranslations } from "next-intl/server";

interface TermsSectionItem {
  heading: string;
  paragraphs: string[];
  isPart?: boolean;
}

export async function TermsBodySection() {
  const t = await getTranslations("terms");
  const sections = t.raw("sections") as TermsSectionItem[];

  return (
    <section className="py-14 sm:py-16">
      <div className="section-wrap flex max-w-3xl flex-col gap-8">
        {sections.map((item) =>
          item.isPart ? (
            <h2
              key={item.heading}
              className="mt-4 border-t border-line pt-8 font-heading text-[13px] font-bold uppercase tracking-[0.14em] text-brand first:mt-0 first:border-t-0 first:pt-0"
            >
              {item.heading}
            </h2>
          ) : (
            <div key={item.heading}>
              <h3 className="mb-3 font-heading text-[19px] font-bold text-ink sm:text-[21px]">{item.heading}</h3>
              <div className="flex flex-col gap-3">
                {item.paragraphs.map((paragraph) => (
                  <p key={paragraph} className="text-[15px] leading-[1.7] text-body">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          ),
        )}
      </div>
    </section>
  );
}
