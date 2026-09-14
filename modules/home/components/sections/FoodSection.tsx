import Image from "next/image";
import { Icon } from "@/components/shared/brand/Icon";
import { foodStats } from "@/modules/home/data/site-data";

const STAT_TONE: Record<string, string> = {
  rose: "bg-brand-soft text-brand",
  azure: "bg-[#e6f0fd] text-[#2f6ec4]",
  navy: "bg-[#eaf0fa] text-[#1f3a68]",
};

export function FoodSection() {
  return (
    <section id="food" className="py-16 md:py-[92px]">
      <div className="section-wrap grid grid-cols-1 items-center gap-10 md:grid-cols-[minmax(0,47%)_minmax(0,53%)]">
        <div>
          <span className="inline-flex items-center gap-[7px] rounded-full border border-brand bg-brand-soft px-3.5 py-1.5 text-[10px] font-bold tracking-[0.08em] text-brand">
            <i className="size-[5px] rounded-full bg-brand" /> NOW SERVING
            SANTA TERESA
          </span>
          <h2 className="mb-5 mt-6 text-[clamp(32px,3.6vw,50px)] font-extrabold leading-[1.04] tracking-[-0.028em]">
            <span className="text-brand">Local Food</span>
            <br />
            and Daily Essentials
          </h2>
          <p className="mb-8 max-w-[420px] text-body">
            SIPP connects customers with nearby restaurants, supermarkets, and
            local businesses for simple delivery across Costa Rica&apos;s coastal
            communities.
          </p>
          <div className="flex gap-2 md:flex-wrap md:gap-4">
            {foodStats.map(({ icon, tone, value, label }) => (
              <div
                key={label}
                className="flex min-w-0 flex-1 items-center gap-1.5 rounded-2xl bg-card px-2 py-2.5 shadow-card sm:gap-2.5 sm:px-3 sm:py-3 md:min-w-32 md:flex-none md:px-4"
              >
                <i
                  className={`grid size-8 flex-none place-items-center rounded-[10px] sm:size-[34px] ${STAT_TONE[tone]}`}
                >
                  <Icon name={icon} className="size-[18px] flex-none" />
                </i>
                <span>
                  <b className="block font-heading text-xs font-bold text-ink sm:text-sm">
                    {value}
                  </b>
                  <small className="mt-0.5 block text-[7px] tracking-[0.06em] text-muted sm:text-[8px] sm:tracking-[0.1em]">
                    {label}
                  </small>
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="relative mx-auto aspect-[5/4] w-full max-w-[460px] md:max-w-none">
          <Image
            src="/food-collage.png"
            alt="A spread of dishes available on SIPP"
            fill
            preload
            className="object-contain"
            sizes="(max-width: 900px) 90vw, 50vw"
          />
        </div>
      </div>
    </section>
  );
}
