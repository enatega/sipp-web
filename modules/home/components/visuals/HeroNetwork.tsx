import type { CSSProperties } from "react";
import Image from "next/image";
import { Icon } from "@/components/shared/brand/Icon";
import { cn } from "@/lib/utils";
import { ecosystemServices } from "@/modules/home/data/site-data";
import styles from "@/modules/home/styles/home.module.css";

const DOT_TONE: Record<string, string> = {
  green: "bg-[#16b473]",
  blue: "bg-[#1878e0]",
  orange: "bg-[#f2731d]",
  pink: "bg-[#dc2f5e]",
  purple: "bg-[#7040d4]",
};

/* The pills and spokes share a taller coordinate system. This keeps the top
   and bottom services on the centre axis while giving the side branches the
   open, radial spacing used by the reference composition. `edge` is the side
   of the pill facing the crest and therefore sits on the anchor. */
const BOX_W = 620;
const BOX_H = 520;
const CENTRE_X = 310;
const CENTRE_Y = 260;
/* The crest is 27% of the box width. Start each spoke just beyond its edge. */
const CORE_RADIUS = 90;
const PILL_GAP = 12;

type Anchor = {
  x: number;
  y: number;
  edge: "left" | "right" | "top" | "bottom";
};

const ANCHORS: Record<string, Anchor> = {
  ride: { x: 310, y: 60, edge: "bottom" },
  market: { x: 468, y: 112, edge: "left" },
  business: { x: 500, y: 205, edge: "left" },
  farmers: { x: 507, y: 281, edge: "left" },
  community: { x: 445, y: 423, edge: "left" },
  courier: { x: 310, y: 461, edge: "top" },
  ai: { x: 178, y: 414, edge: "right" },
  payments: { x: 123, y: 269, edge: "right" },
  food: { x: 186, y: 112, edge: "right" },
};

function pillStyle({ x, y, edge }: Anchor): CSSProperties {
  const left = `${(x / BOX_W) * 100}%`;
  const right = `${((BOX_W - x) / BOX_W) * 100}%`;
  const top = `${(y / BOX_H) * 100}%`;
  const bottom = `${((BOX_H - y) / BOX_H) * 100}%`;

  switch (edge) {
    case "left":
      return { left, top, transform: "translateY(-50%)" };
    case "right":
      return { right, top, transform: "translateY(-50%)" };
    case "top":
      return { left, top, transform: "translateX(-50%)" };
    case "bottom":
      return { left, bottom, transform: "translateX(-50%)" };
  }
}

function spoke({ x, y }: Anchor) {
  const dx = x - CENTRE_X;
  const dy = y - CENTRE_Y;
  const length = Math.hypot(dx, dy);
  const ux = dx / length;
  const uy = dy / length;
  return {
    x1: CENTRE_X + ux * CORE_RADIUS,
    y1: CENTRE_Y + uy * CORE_RADIUS,
    x2: CENTRE_X + ux * (length - PILL_GAP),
    y2: CENTRE_Y + uy * (length - PILL_GAP),
  };
}

export function HeroNetwork() {
  return (
    <div
      className="relative mx-auto aspect-[31/26] w-full max-w-[360px] sm:max-w-[620px]"
      aria-label="The Shaaneiol service ecosystem"
    >
      <div className="absolute inset-0">
        {/* dashed spokes radiating from the crest out to each service pill */}
        <svg
          className="absolute inset-0 size-full fill-none stroke-[#c77d89] stroke-[1.5]"
          viewBox={`0 0 ${BOX_W} ${BOX_H}`}
          aria-hidden="true"
        >
          {/* Each spoke's dash pattern marches outward from the crest, so the
              ecosystem reads as a live connection. Every line is offset a
              little so the whole diagram never pulses in lockstep. */}
          {ecosystemServices.map(({ label, pos }, index) => (
            <line
              key={label}
              className={styles.heroDash}
              style={{ animationDelay: `${index * 0.14}s` }}
              {...spoke(ANCHORS[pos])}
            />
          ))}
        </svg>

        <div className={cn(styles.heroCard, "absolute left-1/2 top-1/2 grid w-[27%] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-card shadow-pop before:col-start-1 before:row-start-1 before:block before:pb-[100%] before:content-['']")}>
          {/* the lockup is cropped just below the wordmark so the strapline,
              which would render illegibly small at this size, is left out */}
          <span className="col-start-1 row-start-1 block aspect-[111/99] w-[71.5%] overflow-hidden">
            <Image
              src="/brand/shaaneiol-logo.png"
              alt="Shaaneiol"
              width={228}
              height={220}
              sizes="160px"
              className="w-full"
            />
          </span>
        </div>

        {/* The outer node carries the layout transform and the entrance; the
            inner one does the drift, so a pill never leaves its anchor. */}
        {ecosystemServices.map(({ label, icon, tone, pos }, index) => (
          <div
            key={label}
            style={
              {
                ...pillStyle(ANCHORS[pos]),
                "--d": `${260 + index * 70}ms`,
              } as CSSProperties
            }
            className={cn(styles.heroCard, "absolute")}
          >
            <div
              className={cn(styles.heroNode, "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-card px-2.5 py-1.5 text-[9px] font-semibold shadow-pop sm:gap-2 sm:px-3 sm:py-[7px] sm:text-[11px] lg:px-3.5 lg:py-2 lg:text-[12px]")}
              style={
                { "--float-delay": `${index * 0.45}s` } as CSSProperties
              }
            >
              <i
                className={`grid size-[18px] place-items-center rounded-full text-white sm:size-[22px] lg:size-6 ${DOT_TONE[tone]}`}
              >
                <Icon name={icon} className="size-3 flex-none" />
              </i>
              {label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
