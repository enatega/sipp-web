import { getTranslations } from "next-intl/server";

export async function AboutDifferentSection() {
  const t = await getTranslations("about.different");
  const items = t.raw("items") as string[];

  return (
    <section className="bg-surface py-14 sm:py-20">
      <div className="section-wrap max-w-4xl">
        <h2 className="mb-4 font-heading text-[26px] font-bold text-ink sm:text-[32px]">
          {t("title")}
        </h2>
        <p className="max-w-2xl text-[15px] leading-[1.7] text-body">{t("intro")}</p>

        <p className="mb-3.5 mt-8 text-[11px] font-semibold tracking-[0.14em] text-muted">
          {t("focusLabel").toUpperCase()}
        </p>
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {items.map((item) => (
            <li
              key={item}
              className="flex items-start gap-3 rounded-2xl border border-line bg-card px-4 py-3.5 text-sm leading-[1.5] text-ink"
            >
              <svg
                viewBox="0 0 20 20"
                aria-hidden="true"
                className="mt-0.5 size-4 flex-none text-brand"
              >
                <path
                  d="M4 10.5l3.6 3.6L16 5.7"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {item}
            </li>
          ))}
        </ul>

        <div className="mt-8 flex flex-col gap-4">
          <p className="text-[15px] leading-[1.7] text-body">{t("outro")}</p>
          <p className="text-[15px] leading-[1.7] text-body">{t("result")}</p>
        </div>
      </div>
    </section>
  );
}
