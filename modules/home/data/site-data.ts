import type { IconName } from "@/components/shared/brand/Icon";

export const navServices = [
  { group: "SHOP", links: ["Groceries", "Drinks", "Essentials"] },
  { group: "EAT", links: ["Food Delivery", "Restaurants", "Local Picks"] },
];

/** Pills orbiting the hero crest. `pos` maps to a placement class in globals.css. */
export const ecosystemServices: {
  label: string;
  icon: IconName;
  tone: string;
  pos: string;
}[] = [
  { label: "Restaurants", icon: "food", tone: "blue", pos: "ride" },
  { label: "Groceries", icon: "market", tone: "orange", pos: "market" },
  { label: "Local Shops", icon: "business", tone: "pink", pos: "business" },
  { label: "Fresh Finds", icon: "farmers", tone: "green", pos: "farmers" },
  { label: "Beach Towns", icon: "community", tone: "pink", pos: "community" },
  { label: "Local Delivery", icon: "courier", tone: "purple", pos: "courier" },
  { label: "Easy Reorders", icon: "ai", tone: "blue", pos: "ai" },
  { label: "Secure Payments", icon: "payments", tone: "green", pos: "payments" },
  { label: "Food Delivery", icon: "food", tone: "blue", pos: "food" },
];

export const foodStats: {
  icon: IconName;
  tone: string;
  value: string;
  label: string;
}[] = [
  { icon: "store", tone: "rose", value: "LOCAL", label: "BUSINESSES" },
  { icon: "pin", tone: "azure", value: "COASTAL", label: "AREAS" },
  { icon: "orders", tone: "navy", value: "DAILY", label: "ESSENTIALS" },
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
    title: "Local Favorites",
    copy: "Order meals from nearby restaurants and cafes.",
  },
  {
    icon: "dining",
    tone: "peach",
    title: "Groceries & Drinks",
    copy: "Stock up from supermarkets and local shops.",
  },
  {
    icon: "leaf",
    tone: "forest",
    title: "Coastal Coverage",
    copy: "Starting in Santa Teresa and nearby communities.",
    toggle: true,
  },
  {
    icon: "tag",
    tone: "periwinkle",
    title: "Useful Deals",
    copy: "Find offers from participating local businesses.",
  },
  {
    icon: "catering",
    tone: "sky",
    title: "Everyday Essentials",
    copy: "Get the basics delivered when your day is full.",
  },
  {
    icon: "wallet",
    tone: "sky",
    title: "Simple Payments",
    copy: "Pay securely and keep checkout moving.",
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
    title: "SIPP Food",
    icon: "/brand/shaaneiol-food.png",
    copy: "Discover local restaurants and order food across town.",
  },
  {
    tone: "store",
    title: "SIPP Store",
    icon: "/brand/shaaneiol-store.png",
    copy: "Bring your restaurant, supermarket, or shop to local customers.",
  },
  {
    tone: "driver",
    title: "SIPP Driver",
    icon: "/brand/shaaneiol-driver.png",
    copy: "Deliver orders across SIPP service areas with clear order flow.",
  },
  {
    tone: "rider",
    title: "SIPP Rider",
    icon: "/brand/shaaneiol-rider.png",
    copy: "Find food, groceries, drinks, and essentials in one place.",
  },
] as const;
