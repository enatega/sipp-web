/**
 * Public SIPP customer app listings (bundle id `com.sipp.delivery.app`).
 * A store's button is hidden while its link is null, so the site never sends
 * customers to a generic store home page. Set `apple` once the iOS app is live.
 */
export const appStoreLinks: { apple: string | null; google: string | null } = {
  apple: null,
  google: "https://play.google.com/store/apps/details?id=com.sipp.delivery.app",
};

export const footerColumns = [
  { title: "COMPANY", links: ["About SIPP", "Partner with us", "How it works"] },
  {
    title: "LEGAL & SUPPORT",
    links: ["Terms & Condition", "Contact Us"],
  },
] as const;
