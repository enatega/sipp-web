import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { getValueProps } from "@/modules/home/data/site-data";

export async function ValueSection() {
  const t = await getTranslations("home.value");
  const valueProps = getValueProps(t);
  return (
    <section id="about" className="pb-8 pt-8 text-center sm:pb-[60px] sm:pt-[84px]">
      <div className="section-wrap">
        <div className="grid grid-cols-3 items-center gap-1 rounded-[26px] bg-pinkbar px-2 py-6 sm:gap-2 sm:px-3 md:gap-0 md:px-2.5 md:py-[30px]">
          {valueProps.map(({ icon, title }, index) => (
            <div
              key={title}
              className={`flex flex-col items-center justify-center gap-1 text-center sm:gap-2 md:flex-row md:gap-5 md:text-left md:border-r md:border-[rgba(102,192,242,0.16)] ${
                index === valueProps.length - 1 ? "md:border-r-0" : ""
              }`}
            >
              <Image
                className="h-auto w-11 flex-none object-contain sm:w-12 md:w-[72px]"
                src={icon}
                alt=""
                width={140}
                height={156}
                sizes="72px"
              />
              <b className="flex flex-col font-heading text-[11px] font-bold leading-[1.12] sm:text-xs md:text-left md:text-2xl">
                {title.split("\n").map((line) => (
                  <span key={line}>{line}</span>
                ))}
              </b>
            </div>
          ))}
        </div>
        <h2 className="mb-3.5 mt-8 font-crest text-[32px] font-bold tracking-[0.05em] text-brand sm:mt-[52px] sm:text-[clamp(34px,4vw,54px)]">
          SIPP
        </h2>
        <p className="text-[10px] font-medium tracking-[0.18em] text-muted sm:text-[11px] sm:tracking-[0.24em]">
          {t("tagline")}
        </p>
      </div>
    </section>
  );
}
