import { getTranslations } from "next-intl/server";

interface PrivacyListGroup {
  title: string;
  items: string[];
}

interface PrivacySectionItem {
  heading: string;
  paragraphs?: string[];
  items?: string[];
  groups?: PrivacyListGroup[];
}

function PrivacyList({ items }: { items: string[] }) {
  return (
    <ul className="flex list-disc flex-col gap-2 ps-5 marker:text-brand">
      {items.map((item) => (
        <li key={item} className="text-[15px] leading-[1.7] text-body">
          {item}
        </li>
      ))}
    </ul>
  );
}

export async function PrivacyBodySection() {
  const t = await getTranslations("privacy");
  const sections = t.raw("sections") as PrivacySectionItem[];

  return (
    <section className="py-14 sm:py-16">
      <div className="section-wrap flex max-w-3xl flex-col gap-8">
        {sections.map((section) => (
          <div key={section.heading}>
            <h2 className="mb-3 font-heading text-[19px] font-bold text-ink sm:text-[21px]">{section.heading}</h2>
            <div className="flex flex-col gap-3">
              {section.paragraphs?.map((paragraph) => (
                <p key={paragraph} className="text-[15px] leading-[1.7] text-body">
                  {paragraph}
                </p>
              ))}
              {section.items ? <PrivacyList items={section.items} /> : null}
              {section.groups?.map((group) => (
                <div key={group.title} className="flex flex-col gap-2">
                  <h3 className="font-heading text-[15px] font-semibold text-ink">{group.title}</h3>
                  <PrivacyList items={group.items} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
