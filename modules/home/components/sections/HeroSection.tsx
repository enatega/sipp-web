import { EcosystemSlideView } from "@/modules/home/components/hero/EcosystemSlideView";
import { HeroCarousel } from "@/modules/home/components/hero/HeroCarousel";
import { ServiceSlideView } from "@/modules/home/components/hero/ServiceSlideView";
import { heroSlides } from "@/modules/home/data/hero-slides";

export function HeroSection() {
  return (
    <section
      id="top"
      /* The hero occupies exactly one screen below the sticky header, so the
         whole carousel is visible without scrolling. `svh` (not `vh`) so a
         mobile browser's collapsing toolbar cannot push it out of view. */
      className="relative flex min-h-[calc(100svh-64px)] flex-col justify-center overflow-hidden bg-[linear-gradient(105deg,#fff_12%,#fff4ef_65%,#ffeae6)] py-7 dark:bg-[linear-gradient(105deg,#111316_12%,#20171a_65%,#28191d)] md:min-h-[calc(100svh-76px)] md:py-9"
    >
      <HeroCarousel
        items={heroSlides.map((slide) => ({
          id: slide.id,
          name: slide.name,
          hold: slide.animation.hold,
          node:
            slide.type === "ecosystem" ? (
              <EcosystemSlideView slide={slide} />
            ) : (
              <ServiceSlideView slide={slide} />
            ),
        }))}
      />
    </section>
  );
}
