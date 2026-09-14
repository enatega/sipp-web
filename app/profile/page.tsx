import type { Metadata } from "next";
import { Header } from "@/components/shared/app-shell/Header";
import { ProfileDashboard } from "@/modules/account";

export const metadata: Metadata = {
  title: "Profile | Shaaneiol",
  description: "Manage your Shaaneiol profile and account settings.",
};

export default function ProfilePage() {
  return (
    <>
      <Header />
      <ProfileDashboard />
    </>
  );
}
