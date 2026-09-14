import type { Metadata } from "next";
import { AccountSecurity } from "@/modules/account";

export const metadata: Metadata = {
  title: "Account Security | Shaaneiol",
  description: "Change your password or manage your Shaaneiol account.",
};

export default function AccountSecurityPage() {
  return <AccountSecurity />;
}
