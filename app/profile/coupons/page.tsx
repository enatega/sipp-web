import type { Metadata } from "next";
import { CouponsPage } from "@/modules/account";

export const metadata: Metadata = {
  title: "Offers | SIPP",
  description: "Claim and manage your SIPP offers.",
};

export default function CustomerCouponsPage() {
  return <CouponsPage />;
}
