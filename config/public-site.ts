export const appStoreLinks = {
  apple: "https://www.apple.com/app-store/",
  google: "https://play.google.com/store",
} as const;

export const footerColumns = [
  { title: "COMPANY", links: ["About SIPP", "Partner with us", "Help"] },
  {
    title: "ALL IN ONE PLACE",
    links: [
      "Restaurants",
      "Groceries",
      "Drinks",
      "Essentials",
    ],
  },
  {
    title: "LEGAL",
    links: [
      "Terms & Condition",
      "Cookie Policy",
      "Privacy Policy",
      "Help & Support",
    ],
  },
] as const;
