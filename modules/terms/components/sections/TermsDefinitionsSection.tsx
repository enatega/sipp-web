import { getTranslations } from "next-intl/server";

interface DefinitionItem {
  term: string;
  description: string;
}

export async function TermsDefinitionsSection() {
  const t = await getTranslations("terms.definitions");
  const items = t.raw("items") as DefinitionItem[];

  return (
    <section className="bg-pinkbar py-14 sm:py-16">
      <div className="section-wrap max-w-3xl">
        <h2 className="mb-6 font-heading text-[24px] font-bold text-ink sm:text-[28px]">{t("heading")}</h2>
        <dl className="flex flex-col gap-3">
          {items.map((item) => (
            <div key={item.term} className="text-[15px] leading-[1.7] text-body">
              <dt className="inline font-semibold text-ink">&ldquo;{item.term}&rdquo;: </dt>
              <dd className="inline">{item.description}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
