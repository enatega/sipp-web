import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";
import { HeroLocationSearch } from "@/modules/home/components/hero/HeroLocationSearch";
import { HeroNetwork } from "@/modules/home/components/visuals/HeroNetwork";
import type { EcosystemSlide } from "@/modules/home/data/hero-slides";
import styles from "@/modules/home/styles/home.module.css";

/** Slide 1: the crest with its orbiting service pills. */
export function EcosystemSlideView({ slide }: { slide: EcosystemSlide }) {
  const step = slide.animation.stagger ?? 90;
  const delay = (index: number) => ({ "--d": `${index * step}ms` }) as CSSProperties;

  return (
    <div className="section-wrap grid grid-cols-1 items-center gap-6 md:grid-cols-[minmax(0,46%)_minmax(0,54%)] md:gap-6">
      <div>
        <p
          className={cn(styles.heroIn, "mb-3 flex items-center gap-2.5 text-xs font-bold tracking-[0.14em] text-brand md:mb-[18px]")}
          style={delay(0)}
        >
          <span className="h-0.5 w-[26px] bg-brand" />
          {slide.eyebrow}
        </p>
        <h1
          className={cn(styles.heroIn, "mb-4 text-[clamp(32px,4.4vw,62px)] font-extrabold leading-[1.06] tracking-[-0.03em] md:mb-[22px]")}
          style={delay(1)}
        >
          {slide.title}
        </h1>
        <p
          className={cn(styles.heroIn, "mb-5 max-w-[430px] text-[14px] leading-[1.55] text-body md:mb-[26px] md:text-[15px]")}
          style={delay(2)}
        >
          {slide.description}
        </p>
        <HeroLocationSearch className={styles.heroIn} style={delay(3)} />
        <dl className="mt-6 flex flex-wrap gap-x-6 gap-y-4 md:mt-8 md:flex-nowrap md:gap-10">
          {slide.stats.map(({ value, label }, index) => (
            <div
              key={label}
              className={cn(styles.heroIn, "flex flex-col")}
              style={delay(4 + index * 0.5)}
            >
              <dt className="font-heading text-[22px] font-bold leading-[1.2]">
                {value}
              </dt>
              <dd className="mt-0.5 text-[11px] font-semibold text-brand">
                {label}
              </dd>
            </div>
          ))}
        </dl>
      </div>
      <HeroNetwork />
    </div>
  );
}
