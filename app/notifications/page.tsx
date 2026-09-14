import type { Metadata } from "next";
import { Header } from "@/components/shared/app-shell/Header";
import { NotificationInbox } from "@/modules/account/components/notifications/NotificationInbox";

export const metadata: Metadata = {
  title: "Notifications | Shaaneiol",
  description: "View recent Shaaneiol notifications.",
};

export default function NotificationsPage() {
  return <><Header /><NotificationInbox /></>;
}
