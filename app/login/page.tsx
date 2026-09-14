import type { Metadata } from "next";
import { AuthExperience } from "@/modules/account";

export const metadata: Metadata = {
  title: "Login | SIPP",
  description: "Sign in or create your SIPP customer account.",
};

interface LoginPageProps {
  searchParams: Promise<{ returnTo?: string | string[] }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const value = (await searchParams).returnTo;
  return <AuthExperience returnTo={Array.isArray(value) ? value[0] : value} />;
}
