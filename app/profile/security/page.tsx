import type { Metadata } from "next";
import { AccountSecurity } from "@/modules/account";

export const metadata: Metadata = {
  title: "Account Security | SIPP",
  description: "Change your password or manage your SIPP account.",
};

export default function AccountSecurityPage() {
  return <AccountSecurity />;
}
