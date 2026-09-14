import Image from "next/image";
import { products } from "@/modules/home/data/site-data";

const CARD_TONE: Record<string, string> = {
  food: "border-[rgba(245,222,226,0.7)] bg-[linear-gradient(180deg,#fbe6e8_0%,#fdf1f2_42%,#fff_100%)]",
  store:
    "border-[rgba(246,219,232,0.7)] bg-[linear-gradient(180deg,#fbe4ef_0%,#fdf0f6_42%,#fff_100%)]",
  driver:
    "border-[rgba(242,230,182,0.7)] bg-[linear-gradient(180deg,#fdf4d8_0%,#fefaee_42%,#fff_100%)]",
  rider:
    "border-[rgba(226,223,250,0.7)] bg-[linear-gradient(180deg,#e8e6fb_0%,#f4f3fd_42%,#fff_100%)]",
};

export function ProductsSection() {
  return (
    <section id="products" className="pb-8 pt-4 sm:pb-24 sm:pt-10">
      <div className="section-wrap flex snap-x snap-mandatory gap-5 overflow-x-auto overscroll-x-contain pb-3 touch-pan-x [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:grid sm:grid-cols-2 sm:justify-center sm:gap-[30px] sm:overflow-visible sm:pb-0 lg:grid-cols-4">
        {products.map(({ tone, title, icon, copy }) => (
          <article
            className={`mx-auto flex w-[82vw] max-w-[360px] flex-none snap-center flex-col items-center rounded-[20px] border px-5 pb-6 pt-6 text-center sm:w-full sm:max-w-[262px] sm:snap-none sm:px-[22px] sm:pb-6 sm:pt-[26px] ${CARD_TONE[tone]}`}
            key={title}
          >
            <Image
              className="mb-4 size-[clamp(88px,24vw,100px)] rounded-[22px] bg-card shadow-card"
              src={icon}
              alt={`${title} app icon`}
              width={320}
              height={320}
              sizes="100px"
            />
            <h3 className="text-[15px] font-bold sm:text-[17px]">{title}</h3>
            <p className="mb-5 mt-2.5 max-w-[190px] text-xs leading-[1.55] text-body sm:text-[13px] sm:leading-[1.6]">
              {copy}
            </p>
            <a
              href="#app"
              className="mt-auto text-xs font-semibold text-brand sm:text-[13px]"
            >
              Get Started &rarr;
            </a>
          </article>
        ))}
      </div>
    </section>
  );
}
