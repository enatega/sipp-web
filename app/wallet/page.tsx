import type { Metadata } from "next";

import { WalletDashboard } from "@/modules/account";

export const metadata: Metadata = {
  title: "Wallet | SIPP",
};

interface Props {
  searchParams: Promise<{ topUpAmount?: string; returnTo?: string }>;
}

export default async function WalletPage({ searchParams }: Props) {
  const query = await searchParams;
  const amount = typeof query.topUpAmount === "string" && /^\d+(?:\.\d{1,2})?$/.test(query.topUpAmount)
    ? Number(query.topUpAmount)
    : null;
  const initialTopUpAmount = amount !== null && Number.isFinite(amount) && amount > 0
    ? Math.min(999_999.99, Math.max(500, amount))
    : null;
  return <WalletDashboard initialTopUpAmount={initialTopUpAmount} returnToCheckout={query.returnTo === "checkout"} />;
}
