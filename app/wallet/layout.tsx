import { Header } from "@/components/shared/app-shell/Header";

export default function WalletLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <Header />
      {children}
    </>
  );
}
