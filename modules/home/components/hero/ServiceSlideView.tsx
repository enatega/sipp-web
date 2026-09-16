import type { CSSProperties } from "react";
import { Icon } from "@/components/shared/brand/Icon";
import { cn } from "@/lib/utils";
import { FloatingCards } from "@/modules/home/components/hero/FloatingCard";
import { Glyph } from "@/modules/home/components/hero/Glyph";
import { HeroMedia } from "@/modules/home/components/hero/HeroMedia";
import { HeroLocationSearch } from "@/modules/home/components/hero/HeroLocationSearch";
import type { ServiceSlide } from "@/modules/home/data/hero-slides";
import styles from "@/modules/home/styles/home.module.css";

const BENEFIT_TONE: Record<string, string> = {
  peach: "bg-[#fdeee7] text-brand",
  amber: "bg-[#fdf3dd] text-[#b7791f]",
  mint: "bg-[#e7f6ec] text-[#1f8a4c]",
};

/** Slides 2 and 3: headline block beside a photo with floating status cards. */
export function ServiceSlideView({ slide }: { slide: ServiceSlide }) {
  const step = slide.animation.stagger ?? 90;
  const delay = (index: number) => ({ "--d": `${index * step}ms` }) as CSSProperties;

  return (
    <div className="section-wrap grid grid-cols-1 items-center gap-6 md:grid-cols-[minmax(0,46%)_minmax(0,54%)] md:gap-6">
      <div>
        <p
          className={cn(styles.heroIn, "mb-4 inline-flex items-center gap-2.5 rounded-full bg-card py-1.5 pl-1.5 pr-4 shadow-card md:mb-[22px]")}
          style={delay(0)}
        >
          <span className="rounded-full bg-brand px-2.5 py-1 text-[10px] font-bold tracking-[0.06em] text-ink">
            {slide.badge.flag}
          </span>
          <span className="text-[13px] font-medium text-ink">
            {slide.badge.text}
          </span>
          <Icon name={slide.badge.icon} className="size-3.5 flex-none text-brand" />
        </p>
        <h1
          className={cn(styles.heroIn, "mb-4 text-[clamp(30px,4.1vw,58px)] font-extrabold leading-[1.2] tracking-[-0.03em] md:mb-[22px]")}
          style={delay(1)}
        >
          {slide.title}
        </h1>
        <p
          className={cn(styles.heroIn, "mb-5 max-w-[420px] text-[14px] leading-[1.55] text-body md:mb-[26px] md:text-[15px]")}
          style={delay(2)}
        >
          {slide.description}
        </p>
        <HeroLocationSearch className={styles.heroIn} style={delay(3)} />
        <ul className="mt-6 flex flex-wrap gap-x-4 gap-y-3 sm:gap-x-7 md:mt-9">
          {slide.benefits.map(({ glyph, label, tone }, index) => (
            <li
              key={label}
              className={cn(styles.heroIn, "flex items-center gap-2 text-[12px] font-medium text-ink sm:gap-2.5 sm:text-[13px]")}
              style={delay(4 + index * 0.5)}
            >
              <i
                className={`grid size-7 place-items-center rounded-[10px] sm:size-8 ${
                  BENEFIT_TONE[tone] ?? BENEFIT_TONE.mint
                }`}
              >
                <Glyph glyph={glyph} className="size-4 sm:size-[18px]" />
              </i>
              {label}
            </li>
          ))}
        </ul>
      </div>

      <div className="relative mx-auto w-full max-w-[300px] sm:max-w-[480px] lg:max-w-[560px]">
        <HeroMedia
          image={slide.image}
          panel={slide.panel}
          fallbackIcon={slide.fallbackIcon}
        />
        <FloatingCards cards={slide.cards} baseDelay={step * 3} />
      </div>
    </div>
  );
}
