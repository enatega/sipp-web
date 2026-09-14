import type { IconName } from "@/components/shared/brand/Icon";

export const navServices = [
  { group: "MOVE", links: ["Ride", "Courier"] },
  { group: "EAT", links: ["Food Delivery", "Restaurants", "Home Made"] },
];

/** Pills orbiting the hero crest. `pos` maps to a placement class in globals.css. */
export const ecosystemServices: {
  label: string;
  icon: IconName;
  tone: string;
  pos: string;
}[] = [
  { label: "Ride Booking", icon: "ride", tone: "blue", pos: "ride" },
  { label: "Marketplace", icon: "market", tone: "orange", pos: "market" },
  { label: "Business", icon: "business", tone: "pink", pos: "business" },
  { label: "Farmers", icon: "farmers", tone: "green", pos: "farmers" },
  { label: "Community", icon: "community", tone: "pink", pos: "community" },
  { label: "Courier", icon: "courier", tone: "purple", pos: "courier" },
  { label: "AI Recs", icon: "ai", tone: "blue", pos: "ai" },
  { label: "Payments", icon: "payments", tone: "green", pos: "payments" },
  { label: "Food Delivery", icon: "food", tone: "blue", pos: "food" },
];

export const serviceStrip = [
  "SHAANEIOL",
  "SHAANEIOL FOOD IN",
  "SHAANEIOL DRIVER",
  "SHAANEIOL RIDER",
  "SHAANEIOL STORE",
];

export const foodStats: {
  icon: IconName;
  tone: string;
  value: string;
  label: string;
}[] = [
  { icon: "store", tone: "rose", value: "50k", label: "RESTAURANTS" },
  { icon: "pin", tone: "azure", value: "100+", label: "CITIES" },
  { icon: "orders", tone: "navy", value: "1B+", label: "ORDERS" },
];

export const benefits: {
  icon: IconName;
  tone: string;
  title: string;
  copy: string;
  /** Green Choice is presented as an opt-in the customer can switch on. */
  toggle?: boolean;
}[] = [
  {
    icon: "utensils",
    tone: "mint",
    title: "Nutritious Eats",
    copy: "Chef-crafted healthy bowls delivered to your door.",
  },
  {
    icon: "dining",
    tone: "peach",
    title: "Fine Dining",
    copy: "Exclusive table bookings at top-tier establishments.",
  },
  {
    icon: "leaf",
    tone: "forest",
    title: "Green Choice",
    copy: "Eco-friendly packaging and carbon-neutral delivery.",
    toggle: true,
  },
  {
    icon: "tag",
    tone: "periwinkle",
    title: "Exclusive Deals",
    copy: "Premium discounts for Shaaneiol elite members.",
  },
  {
    icon: "catering",
    tone: "sky",
    title: "Group Catering",
    copy: "Effortless event planning and bulk orders.",
  },
  {
    icon: "wallet",
    tone: "sky",
    title: "Digital Credits",
    copy: "Unified wallet for instant payments and global transfers.",
  },
];

export const valueProps: { icon: string; title: string }[] = [
  { icon: "/brand/daily-discounts.png", title: "Daily\nDiscounts" },
  { icon: "/brand/live-tracing.png", title: "Live\nTracing" },
  { icon: "/brand/quick-delivery.png", title: "Quick\nDelivery" },
];

export const products = [
  {
    tone: "food",
    title: "Shaaneiol Food",
    icon: "/brand/shaaneiol-food.png",
    copy: "Get the app and discover delicious meals delivered to your door.",
  },
  {
    tone: "store",
    title: "Shaaneiol Store",
    icon: "/brand/shaaneiol-store.png",
    copy: "Everything you need to manage your store in one app.",
  },
  {
    tone: "driver",
    title: "Shaaneiol Driver",
    icon: "/brand/shaaneiol-driver.png",
    copy: "Manage deliveries efficiently with the Shaaneiol Driver app.",
  },
  {
    tone: "rider",
    title: "Shaaneiol Rider",
    icon: "/brand/shaaneiol-rider.png",
    copy: "Discover restaurants and enjoy fast doorstep delivery.",
  },
] as const;
