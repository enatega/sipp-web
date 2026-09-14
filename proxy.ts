import { NextRequest, NextResponse } from "next/server";
import { defaultLocale, isLocale } from "@/i18n/config";

export function proxy(request: NextRequest) {
  const candidate = request.cookies.get("NEXT_LOCALE")?.value;
  const locale = isLocale(candidate) ? candidate : defaultLocale;
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-locale", locale);

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
