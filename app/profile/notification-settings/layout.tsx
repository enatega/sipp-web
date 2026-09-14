import { Header } from "@/components/shared/app-shell/Header";

export default function NotificationSettingsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <Header />
      {children}
    </>
  );
}
