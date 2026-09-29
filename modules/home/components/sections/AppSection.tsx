import { StoreButtons } from "@/components/shared/brand/StoreButtons";
import { getTranslations } from "next-intl/server";
import { ServicesPhone } from "@/modules/home/components/visuals/ServicesPhone";
import { DetailPhone } from "@/modules/home/components/visuals/DetailPhone";

export async function AppSection() {
  const t = await getTranslations("home.appSection");
  return (
    <section
      id="app"
      className="relative overflow-hidden bg-[linear-gradient(180deg,#fff_0_62%,var(--color-brand)_62%)] pt-[60px] md:bg-[linear-gradient(180deg,#fff_0_55%,#fff8f5)] md:pb-0 md:pt-[30px]"
    >
      {/* the design's red sweep: a wedge in the bottom-left corner and a large
          curve filling the bottom-right, drawn so it never runs under the copy */}
      <svg
        className="absolute inset-0 hidden size-full fill-brand md:block"
        viewBox="0 0 1440 640"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path d="M1440 640V392c-150 26-300 96-396 170-46 35-82 62-124 78z" />
        <path d="M0 640V468c48 44 84 106 110 172z" />
      </svg>
      <div className="section-wrap relative z-[1] grid grid-cols-1 items-end justify-items-center gap-10 text-center md:grid-cols-[minmax(0,52%)_minmax(0,48%)] md:justify-items-stretch md:text-left">
        <div className="flex origin-bottom scale-[0.85] items-end gap-4 sm:scale-100 md:-mb-10">
          <DetailPhone ariaLabel={t("detailPhoneLabel")} />
          <ServicesPhone ariaLabel={t("servicesPhoneLabel")} />
        </div>

        <div className="order-first self-center pb-10 md:order-none">
          <h2 className="mb-1 font-crest text-[clamp(30px,3.4vw,46px)] font-bold tracking-[0.05em] text-brand">
            SIPP
          </h2>
          <h3 className="mb-4 text-[clamp(28px,3.2vw,44px)] font-extrabold tracking-[-0.025em]">
            {t("title")}
          </h3>
          <p className="mx-auto mb-[26px] max-w-[400px] text-sm text-body md:mx-0">
            <b className="text-ink">{t("lead")}</b>
            <br />
            {t("description")}
          </p>
          <StoreButtons className="justify-center md:justify-start" />
        </div>
      </div>
    </section>
  );
}
