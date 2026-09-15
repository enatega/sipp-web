import type { Metadata } from "next";

import { WalletDashboard } from "@/modules/account";

export const metadata: Metadata = {
  title: "Wallet | SIPP",
};

export default function WalletPage() {
  return <WalletDashboard />;
}
