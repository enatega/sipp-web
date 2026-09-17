import type { ReactNode } from "react";
import type { IconName } from "@/components/shared/brand/Icon";
import { cn } from "@/lib/utils";
import styles from "@/modules/home/styles/home.module.css";

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

export const heroSlides: HeroSlide[] = [
  {
    type: "ecosystem",
    id: "ecosystem",
    name: "The SIPP ecosystem",
    eyebrow: "LOCAL DELIVERY IN COSTA RICA",
    title: (
      <>
        Food, Groceries,
        <br />
        <span className="text-brand">
          Drinks &
          <br />
          Essentials.
        </span>
      </>
    ),
    description:
      "SIPP brings local restaurants, supermarkets, drinks, and everyday essentials together for convenient delivery in Costa Rica's coastal communities.",
    stats: [
      { value: "SANTA", label: "Teresa first" },
      { value: "LOCAL", label: "Businesses" },
      { value: "COASTAL", label: "Communities" },
      { value: "ONE", label: "Platform" },
    ],
    animation: { hold: 8000, stagger: 90 },
  },
  {
    type: "service",
    id: "food",
    name: "Food delivery",
    badge: { flag: "LOCAL", text: "Now serving Santa Teresa", icon: "spark" },
    title: (
      <>
        Local Food,
        <br />
        <span className={cn(styles.heroUnderline, "text-brand")}>Delivered</span>
        <br />
        Around Town.
      </>
    ),
    description:
      "Order meals, groceries, drinks, and essentials from local businesses in Santa Teresa, Playa Carmen, Mal Pais, Playa Hermosa, Manzanillo, and Santiago.",
    image: {
      src: "/images/image 22.png",
      alt: "Customer holding a slice of pizza",
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
        title: "Courier on the way",
        floatDelay: 0,
      },
      {
        spot: "right",
        kind: "metric",
        caption: "DELIVERY ETA",
        title: "22 mins",
        icon: { img: "/images/clock.png", alt: "" },
        floatDelay: 0.8,
      },
      {
        spot: "bottomLeft",
        kind: "rating",
        title: "Local picks nearby",
        icon: { img: "/images/star-icon.png", alt: "" },
        floatDelay: 1.6,
      },
      {
        spot: "bottomRight",
        kind: "place",
        title: "Location",
        caption: "at destination",
        icon: { img: "/images/location-icon.png", alt: "" },
        floatDelay: 2.4,
      },
    ],
    benefits: [
      { glyph: { img: "/images/clock.png" }, label: "Convenient Delivery", tone: "peach" },
      { glyph: { img: "/images/star-icon.png" }, label: "Local Favorites", tone: "amber" },
      { glyph: { img: "/images/secure-logo.png" }, label: "Secure Checkout", tone: "mint" },
    ],
    animation: { hold: 8000, stagger: 90 },
  },
  {
    type: "service",
    id: "ride",
    name: "Local commerce",
    badge: {
      flag: "SIPP",
      text: "More than food delivery",
      icon: "arrow-out",
    },
    title: (
      <>
        Restaurants &
        <br />
        <span className={cn(styles.heroUnderline, "text-brand")}>Local Shops.</span>
        <br />
        One Checkout.
      </>
    ),
    description:
      "Explore everyday needs from nearby merchants and keep delivery simple, whether you are at home, at work, or staying near the beach.",
    image: {
      src: "/images/hero-woman-eating-burger.jpeg",
      alt: "SIPP local commerce service",
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
        title: "Order is on the way",
        floatDelay: 0,
      },
      {
        spot: "right",
        kind: "metric",
        caption: "DELIVERY ETA",
        title: "Soon",
        icon: { name: "clock" },
        floatDelay: 0.8,
      },
      {
        spot: "bottomLeft",
        kind: "rating",
        title: "Restaurants, groceries, essentials",
        icon: { name: "star" },
        floatDelay: 1.6,
      },
      {
        spot: "bottomRight",
        kind: "place",
        title: "Destination",
        caption: "ready for delivery",
        icon: { name: "pin" },
        floatDelay: 2.4,
      },
    ],
    benefits: [
      { glyph: { img: "/images/clock.png" }, label: "Easy Ordering", tone: "peach" },
      { glyph: { img: "/images/star-icon.png" }, label: "Nearby Stores", tone: "amber" },
      { glyph: { img: "/images/secure-logo.png" }, label: "Secure Payments", tone: "mint" },
    ],
    animation: { hold: 8000, stagger: 90 },
  },
];
