import type { ReactNode } from "react";
import type { IconName } from "@/components/shared/brand/Icon";
import { cn } from "@/lib/utils";
import { getEcosystemServices } from "@/modules/home/data/site-data";
import styles from "@/modules/home/styles/home.module.css";

type Translate = (key: string) => string;

/* ------------------------------------------------------------ hero slides
   Every piece of copy, art and motion the hero carousel renders lives here,
   so a slide can later be swapped for a CMS record without touching the
   carousel or the slide components. Two shapes exist: the ecosystem slide
   (the crest + orbiting service pills) and the service slides (photo with
   floating status cards). */

/** Where a floating card sits over the hero art. */
export type CardSpot = "topLeft" | "right" | "bottomLeft" | "bottomRight";

/** Artwork for a card, a CTA or a benefit: either a supplied illustration
    from `public/images` or one of the drawn line icons. */
export type Glyph = { img: string; alt?: string } | { name: IconName };

export type FloatingCard = {
  spot: CardSpot;
  /** `status` is the green live pill, `metric` a caption + value pair,
      `rating` the star row, `place` a two-line destination note. */
  kind: "status" | "metric" | "rating" | "place";
  title: string;
  caption?: string;
  icon?: Glyph;
  /** Seconds of delay before this card drifts, so they never bob in unison. */
  floatDelay?: number;
};

export type Benefit = { glyph: Glyph; label: string; tone: string };

export type SlideAnimation = {
  /** ms each slide holds before the carousel advances. */
  hold: number;
  /** ms between successive text entrances within the slide. */
  stagger?: number;
};

type BaseSlide = {
  id: string;
  /** Accessible name for the pagination dot. */
  name: string;
  title: ReactNode;
  description: string;
  animation: SlideAnimation;
};

export type EcosystemSlide = BaseSlide & {
  type: "ecosystem";
  eyebrow: string;
  stats: { value: string; label: string }[];
  networkLabel: string;
  services: ReturnType<typeof getEcosystemServices>;
};

export type ServiceSlide = BaseSlide & {
  type: "service";
  badge: { flag: string; text: string; icon: IconName };
  image: {
    src: string;
    alt: string;
    width: number;
    height: number;
    /** Aspect of the frame the photo is cropped into, as a CSS ratio. */
    aspect: string;
    /** Flip horizontally so the subject faces the copy beside it. */
    mirrored?: boolean;
  };
  /** Stands in for the photograph if it cannot be loaded. */
  fallbackIcon: IconName;
  /** Colour of the panel behind the cut-out; omitted for full-bleed photos. */
  panel?: string;
  cards: FloatingCard[];
  benefits: Benefit[];
};

export type HeroSlide = EcosystemSlide | ServiceSlide;

export const getHeroSlides = (t: Translate): HeroSlide[] => [
  {
    type: "ecosystem",
    id: "ecosystem",
    name: t("ecosystem.name"),
    eyebrow: t("ecosystem.eyebrow"),
    title: (
      <>
        {t("ecosystem.titleLine1")}
        <br />
        <span className="text-brand">
          {t("ecosystem.titleAccentLine1")}
          <br />
          {t("ecosystem.titleAccentLine2")}
        </span>
      </>
    ),
    description: t("ecosystem.description"),
    stats: [
      { value: t("ecosystem.stats.santaValue"), label: t("ecosystem.stats.santaLabel") },
      { value: t("ecosystem.stats.localValue"), label: t("ecosystem.stats.localLabel") },
      { value: t("ecosystem.stats.coastalValue"), label: t("ecosystem.stats.coastalLabel") },
      { value: t("ecosystem.stats.oneValue"), label: t("ecosystem.stats.oneLabel") },
    ],
    networkLabel: t("ecosystem.networkLabel"),
    services: getEcosystemServices((key) => t(`ecosystem.services.${key}`)),
    animation: { hold: 8000, stagger: 90 },
  },
  {
    type: "service",
    id: "food",
    name: t("food.name"),
    badge: { flag: t("food.badgeFlag"), text: t("food.badgeText"), icon: "spark" },
    title: (
      <>
        {t("food.titleLine1")}
        <br />
        <span className={cn(styles.heroUnderline, "text-brand")}>{t("food.titleAccent")}</span>
        <br />
        {t("food.titleLine3")}
      </>
    ),
    description: t("food.description"),
    image: {
      src: "/images/image 22.png",
      alt: t("food.imageAlt"),
      width: 516,
      height: 480,
      aspect: "13 / 11",
    },
    fallbackIcon: "food",
    panel: "linear-gradient(150deg,#66c0f2,rgba(102,192,242,0.72))",
    cards: [
      {
        spot: "topLeft",
        kind: "status",
        title: t("food.cards.status"),
        floatDelay: 0,
      },
      {
        spot: "right",
        kind: "metric",
        caption: t("food.cards.etaCaption"),
        title: t("food.cards.etaValue"),
        icon: { img: "/images/clock.png", alt: "" },
        floatDelay: 0.8,
      },
      {
        spot: "bottomLeft",
        kind: "rating",
        title: t("food.cards.rating"),
        icon: { img: "/images/star-icon.png", alt: "" },
        floatDelay: 1.6,
      },
      {
        spot: "bottomRight",
        kind: "place",
        title: t("food.cards.location"),
        caption: t("food.cards.destination"),
        icon: { img: "/images/location-icon.png", alt: "" },
        floatDelay: 2.4,
      },
    ],
    benefits: [
      { glyph: { img: "/images/clock.png" }, label: t("food.benefits.convenientDelivery"), tone: "peach" },
      { glyph: { img: "/images/star-icon.png" }, label: t("food.benefits.localFavorites"), tone: "amber" },
      { glyph: { img: "/images/secure-logo.png" }, label: t("food.benefits.secureCheckout"), tone: "mint" },
    ],
    animation: { hold: 8000, stagger: 90 },
  },
  {
    type: "service",
    id: "ride",
    name: t("commerce.name"),
    badge: {
      flag: t("commerce.badgeFlag"),
      text: t("commerce.badgeText"),
      icon: "arrow-out",
    },
    title: (
      <>
        {t("commerce.titleLine1")}
        <br />
        <span className={cn(styles.heroUnderline, "text-brand")}>{t("commerce.titleAccent")}</span>
        <br />
        {t("commerce.titleLine3")}
      </>
    ),
    description: t("commerce.description"),
    image: {
      src: "/images/hero-woman-eating-burger.jpeg",
      alt: t("commerce.imageAlt"),
      width: 1024,
      height: 1024,
      aspect: "13 / 14",
      // mirrored: true,
    },
    fallbackIcon: "ride",
    cards: [
      {
        spot: "topLeft",
        kind: "status",
        title: t("commerce.cards.status"),
        floatDelay: 0,
      },
      {
        spot: "right",
        kind: "metric",
        caption: t("commerce.cards.etaCaption"),
        title: t("commerce.cards.etaValue"),
        icon: { name: "clock" },
        floatDelay: 0.8,
      },
      {
        spot: "bottomLeft",
        kind: "rating",
        title: t("commerce.cards.rating"),
        icon: { name: "star" },
        floatDelay: 1.6,
      },
      {
        spot: "bottomRight",
        kind: "place",
        title: t("commerce.cards.destinationTitle"),
        caption: t("commerce.cards.destinationCaption"),
        icon: { name: "pin" },
        floatDelay: 2.4,
      },
    ],
    benefits: [
      { glyph: { img: "/images/clock.png" }, label: t("commerce.benefits.easyOrdering"), tone: "peach" },
      { glyph: { img: "/images/star-icon.png" }, label: t("commerce.benefits.nearbyStores"), tone: "amber" },
      { glyph: { img: "/images/secure-logo.png" }, label: t("commerce.benefits.securePayments"), tone: "mint" },
    ],
    animation: { hold: 8000, stagger: 90 },
  },
];
