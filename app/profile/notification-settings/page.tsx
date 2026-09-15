import type { Metadata } from "next";
import { NotificationSettings } from "@/modules/account";

export const metadata: Metadata = {
  title: "Notification Settings | SIPP",
};

export default function NotificationSettingsPage() {
  return <NotificationSettings />;
}
