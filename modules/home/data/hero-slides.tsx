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
  cta: { label: string; glyph: Glyph; href?: string };
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

/** Where a CTA lands when its own destination is missing or unroutable. */
export const CTA_FALLBACK = "#app";

/** Anchors this build can actually scroll to. Anything else falls back rather
    than sending the visitor to a dead URL. */
const KNOWN_ANCHORS = new Set([
  "#top",
  "#food",
  "#services",
  "#about",
  "#products",
  "#app",
]);

export function resolveCtaHref(href?: string): string {
  if (!href) return CTA_FALLBACK;
  if (/^https?:\/\//.test(href)) return href;
  if (href.startsWith("#")) {
    return KNOWN_ANCHORS.has(href) ? href : CTA_FALLBACK;
  }
  return CTA_FALLBACK;
}

export const heroSlides: HeroSlide[] = [
  {
    type: "ecosystem",
    id: "ecosystem",
    name: "The Shaaneiol ecosystem",
    eyebrow: "THE SHAANEIOL ECOSYSTEM",
    title: (
      <>
        One Platform.
        <br />
        <span className="text-brand">
          Endless
          <br />
          Possibilities.
        </span>
      </>
    ),
    description:
      "Connect with food, shopping, rides, local businesses, farmers, communities, learning and digital services all from one ecosystem, one account, one app.",
    stats: [
      { value: "15+", label: "Services" },
      { value: "1,000+", label: "Businesses" },
      { value: "50K+", label: "Customers" },
      { value: "AU & IN", label: "Now live in" },
    ],
    animation: { hold: 8000, stagger: 90 },
  },
  {
    type: "service",
    id: "food",
    name: "Food delivery",
    badge: { flag: "NEW", text: "Traveller Mode is now live", icon: "spark" },
    title: (
      <>
        Delicious Food,
        <br />
        <span className={cn(styles.heroUnderline, "text-brand")}>Delivered</span>
        <br />
        To Your Door.
      </>
    ),
    description:
      "Order from restaurants, home chefs, SHG units, farms and more all in one place. Powered by ShaaneioL delivery across India & Australia.",
    cta: {
      label: "Order Now",
      glyph: { img: "/images/order-now-pizza.png" },
      href: "/discovery",
    },
    image: {
      src: "/images/image 22.png",
      alt: "Customer holding a slice of pizza",
      width: 516,
      height: 480,
      aspect: "13 / 11",
    },
    fallbackIcon: "food",
    panel: "linear-gradient(150deg,#b7182f,#8d1024)",
    cards: [
      {
        spot: "topLeft",
        kind: "status",
        title: "Driver on the way",
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
        title: "4.9 · 12,400+ reviews",
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
      { glyph: { img: "/images/clock.png" }, label: "Fast Delivery", tone: "peach" },
      { glyph: { img: "/images/star-icon.png" }, label: "Top Rated", tone: "amber" },
      { glyph: { img: "/images/secure-logo.png" }, label: "100% Secure", tone: "mint" },
    ],
    animation: { hold: 8000, stagger: 90 },
  },
  {
    type: "service",
    id: "ride",
    name: "Ride booking",
    badge: {
      flag: "NEW",
      text: "City Traveller Mode is now live",
      icon: "arrow-out",
    },
    title: (
      <>
        Your Reliable
        <br />
        <span className={cn(styles.heroUnderline, "text-brand")}>Ride, Anytime.</span>
        <br />
        Anywhere in Town.
      </>
    ),
    description:
      "Book rides with certified local captains. Fast, dependable pickups, transparent pricing, and secure travel across your favorite spots.",
    cta: { label: "Book Now", glyph: { name: "ride" }, href: "#services" },
    image: {
      src: "/images/hero-drive-logo.png",
      alt: "Passenger enjoying a city ride at sunset",
      width: 1024,
      height: 1024,
      aspect: "13 / 14",
      mirrored: true,
    },
    fallbackIcon: "ride",
    cards: [
      {
        spot: "topLeft",
        kind: "status",
        title: "Driver is on the way",
        floatDelay: 0,
      },
      {
        spot: "right",
        kind: "metric",
        caption: "ARRIVAL ETA",
        title: "5 mins",
        icon: { name: "clock" },
        floatDelay: 0.8,
      },
      {
        spot: "bottomLeft",
        kind: "rating",
        title: "4.9 · 18,200+ rides",
        icon: { name: "star" },
        floatDelay: 1.6,
      },
      {
        spot: "bottomRight",
        kind: "place",
        title: "Destination",
        caption: "reached safely",
        icon: { name: "pin" },
        floatDelay: 2.4,
      },
    ],
    benefits: [
      { glyph: { img: "/images/clock.png" }, label: "Fast Pickup", tone: "peach" },
      { glyph: { img: "/images/star-icon.png" }, label: "Top Rated", tone: "amber" },
      { glyph: { img: "/images/secure-logo.png" }, label: "100% Safe", tone: "mint" },
    ],
    animation: { hold: 8000, stagger: 90 },
  },
];
