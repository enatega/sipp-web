import { Header } from "@/components/shared/app-shell/Header";

export default function SavedCardsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <Header />
      {children}
    </>
  );
}
