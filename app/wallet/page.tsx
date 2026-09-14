import type { Metadata } from "next";

import { WalletDashboard } from "@/modules/account";

export const metadata: Metadata = {
  title: "Wallet | Shaaneiol",
};

export default function WalletPage() {
  return <WalletDashboard />;
}
