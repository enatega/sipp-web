import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AuthExperience } from "@/modules/account";
import { safeReturnTo } from "@/modules/account/utils/authRedirect";
import { authCookieNames, hasActiveSession } from "@/services/auth/session";

export const metadata: Metadata = {
  title: "Login | SIPP",
  description: "Sign in or create your SIPP customer account.",
};

interface LoginPageProps {
  searchParams: Promise<{ returnTo?: string | string[] }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const value = (await searchParams).returnTo;
  const returnTo = Array.isArray(value) ? value[0] : value;
  const cookieStore = await cookies();
  if (
    hasActiveSession(
      cookieStore.get(authCookieNames.token)?.value,
      cookieStore.get(authCookieNames.user)?.value,
    )
  ) {
    redirect(safeReturnTo(returnTo));
  }
  return <AuthExperience returnTo={returnTo} />;
}
