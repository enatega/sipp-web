import type { Metadata } from "next";
import { CouponsPage } from "@/modules/account";

export const metadata: Metadata = {
  title: "Coupons | Shaaneiol",
  description: "Claim and manage your Shaaneiol coupons.",
};

export default function CustomerCouponsPage() {
  return <CouponsPage />;
}
