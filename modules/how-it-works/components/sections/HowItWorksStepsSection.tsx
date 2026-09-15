import { getTranslations } from "next-intl/server";

interface Step {
  title: string;
  description: string;
}

export async function HowItWorksStepsSection() {
  const t = await getTranslations("howItWorks.steps");
  const items = t.raw("items") as Step[];

  return (
    <section className="py-14 sm:py-20">
      <div className="section-wrap max-w-3xl">
        <h2 className="mb-8 font-heading text-[26px] font-bold text-ink sm:text-[32px]">
          {t("title")}
        </h2>
        <ol className="flex flex-col gap-6">
          {items.map((step, index) => (
            <li
              key={step.title}
              className="flex gap-4 rounded-2xl border border-line bg-card p-5"
            >
              <span className="flex size-9 flex-none items-center justify-center rounded-full bg-brand text-sm font-bold text-white">
                {index + 1}
              </span>
              <div>
                <h3 className="font-heading text-lg font-bold text-ink">{step.title}</h3>
                <p className="mt-1.5 text-[15px] leading-[1.7] text-body">
                  {step.description}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
