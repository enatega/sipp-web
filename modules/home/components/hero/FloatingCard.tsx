import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";
import { Glyph } from "@/modules/home/components/hero/Glyph";
import type { CardSpot, FloatingCard } from "@/modules/home/data/hero-slides";
import styles from "@/modules/home/styles/home.module.css";

/* Cards are anchored to the corners of the art and allowed to overhang it,
   as in the design. The offsets tuck in on small screens so nothing can be
   pushed past the page gutter. */
const SPOT: Record<CardSpot, string> = {
  topLeft: "left-0 top-[8%] sm:-left-[15%] sm:top-[19%]",
  right: "right-0 top-[32%] sm:-right-[17%] sm:top-[40%]",
  bottomLeft: "bottom-[4%] left-0 sm:-left-[17%] sm:bottom-0",
  bottomRight: "bottom-[10%] right-0 sm:-right-[13%] sm:bottom-[3%]",
};

const GLYPH = "size-5 text-brand sm:size-9";

function CardBody({ card }: { card: FloatingCard }) {
  switch (card.kind) {
    case "status":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-card px-2 py-1 text-[9.5px] font-bold text-[#12a150] shadow-[0_1px_2px_rgba(20,20,30,0.04)] sm:gap-2 sm:px-4 sm:py-2 sm:text-[13px]">
          <span className="size-1.5 flex-none rounded-full bg-[#12a150] sm:size-2" />
          {card.title}
        </span>
      );
    case "metric":
      return (
        <span className="flex items-center gap-1.5 sm:gap-2.5">
          {card.icon ? <Glyph glyph={card.icon} className={GLYPH} /> : null}
          <span>
            <small className="block text-[7px] font-semibold tracking-[0.12em] text-muted sm:text-[9.5px]">
              {card.caption}
            </small>
            <b className="block font-heading text-[11px] font-bold leading-tight sm:text-[16px]">
              {card.title}
            </b>
          </span>
        </span>
      );
    case "rating":
      return (
        <span className="flex items-center gap-1.5 sm:gap-2.5">
          {card.icon ? <Glyph glyph={card.icon} className={GLYPH} /> : null}
          <span>
            <span
              className="block text-[9px] leading-none tracking-[0.08em] text-[#f0731f] sm:text-[13px]"
              aria-hidden="true"
            >
              ★★★★★
            </span>
            <small className="mt-0.5 block text-[9px] text-body sm:mt-1 sm:text-[12px]">
              {card.title}
            </small>
          </span>
        </span>
      );
    case "place":
      return (
        <span className="flex items-center gap-1.5 sm:gap-2.5">
          {card.icon ? <Glyph glyph={card.icon} className={GLYPH} /> : null}
          <span>
            <b className="block font-heading text-[10px] font-bold leading-tight sm:text-[15px]">
              {card.title}
            </b>
            <small className="block text-[9px] text-body sm:text-[12px]">
              {card.caption}
            </small>
          </span>
        </span>
      );
  }
}

export function FloatingCards({
  cards,
  baseDelay,
}: {
  cards: FloatingCard[];
  /** ms after the slide opens before the first card pops in. */
  baseDelay: number;
}) {
  return (
    <>
      {cards.map((card, index) => (
        <div
          key={card.spot}
          className={cn(styles.heroCard, "absolute z-10", SPOT[card.spot])}
          style={{ "--d": `${baseDelay + index * 110}ms` } as CSSProperties}
        >
          <div
            className={cn(styles.heroBob, "rounded-[16px] bg-card shadow-pop sm:rounded-[20px]",
              card.kind === "status"
                ? "p-1 sm:p-2"
                : "px-2 py-1.5 sm:px-4 sm:py-3"
            )}
            style={
              { "--float-delay": `${card.floatDelay ?? 0}s` } as CSSProperties
            }
          >
            <CardBody card={card} />
          </div>
        </div>
      ))}
    </>
  );
}
