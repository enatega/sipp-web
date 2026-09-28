import type { IconName } from "@/components/shared/brand/Icon";

type Translate = (key: string) => string;

export const navServices = [
  { group: "SHOP", links: ["Groceries", "Drinks", "Essentials"] },
  { group: "EAT", links: ["Food Delivery", "Restaurants", "Local Picks"] },
];

/** Pills orbiting the hero crest. `pos` maps to a placement class in globals.css. */
export const getEcosystemServices = (t: Translate): {
  label: string;
  icon: IconName;
  tone: string;
  pos: string;
}[] => [
  { label: t("restaurants"), icon: "food", tone: "blue", pos: "ride" },
  { label: t("groceries"), icon: "market", tone: "orange", pos: "market" },
  { label: t("localShops"), icon: "business", tone: "pink", pos: "business" },
  { label: t("freshFinds"), icon: "farmers", tone: "green", pos: "farmers" },
  { label: t("beachTowns"), icon: "community", tone: "pink", pos: "community" },
  { label: t("localDelivery"), icon: "courier", tone: "purple", pos: "courier" },
  { label: t("easyReorders"), icon: "ai", tone: "blue", pos: "ai" },
  { label: t("securePayments"), icon: "payments", tone: "green", pos: "payments" },
  { label: t("foodDelivery"), icon: "food", tone: "blue", pos: "food" },
];

export const getFoodStats = (t: Translate): {
  icon: IconName;
  tone: string;
  value: string;
  label: string;
}[] => [
  { icon: "store", tone: "rose", value: t("localValue"), label: t("businesses") },
  { icon: "pin", tone: "azure", value: t("coastalValue"), label: t("areas") },
  { icon: "orders", tone: "navy", value: t("dailyValue"), label: t("essentials") },
];

export const getBenefits = (t: Translate): {
  icon: IconName;
  tone: string;
  title: string;
  copy: string;
  /** Green Choice is presented as an opt-in the customer can switch on. */
  toggle?: boolean;
}[] => [
  {
    icon: "utensils",
    tone: "mint",
    title: t("localFavorites.title"),
    copy: t("localFavorites.copy"),
  },
  {
    icon: "dining",
    tone: "peach",
    title: t("groceriesDrinks.title"),
    copy: t("groceriesDrinks.copy"),
  },
  {
    icon: "leaf",
    tone: "forest",
    title: t("coastalCoverage.title"),
    copy: t("coastalCoverage.copy"),
    toggle: true,
  },
  {
    icon: "tag",
    tone: "periwinkle",
    title: t("usefulDeals.title"),
    copy: t("usefulDeals.copy"),
  },
  {
    icon: "catering",
    tone: "sky",
    title: t("everydayEssentials.title"),
    copy: t("everydayEssentials.copy"),
  },
  {
    icon: "wallet",
    tone: "sky",
    title: t("simplePayments.title"),
    copy: t("simplePayments.copy"),
  },
];

export const getValueProps = (t: Translate): { icon: string; title: string }[] => [
  { icon: "/brand/daily-discounts.png", title: t("dailyDiscounts") },
  { icon: "/brand/live-tracing.png", title: t("liveTracking") },
  { icon: "/brand/quick-delivery.png", title: t("quickDelivery") },
];

export const getProducts = (t: Translate) => [
  {
    tone: "food",
    title: t("food.title"),
    icon: "/brand/shaaneiol-food.png",
    copy: t("food.copy"),
  },
  {
    tone: "store",
    title: t("store.title"),
    icon: "/brand/shaaneiol-store.png",
    copy: t("store.copy"),
  },
  {
    tone: "driver",
    title: t("driver.title"),
    icon: "/brand/shaaneiol-driver.png",
    copy: t("driver.copy"),
  },
  {
    tone: "rider",
    title: t("rider.title"),
    icon: "/brand/shaaneiol-rider.png",
    copy: t("rider.copy"),
  },
] as const;
