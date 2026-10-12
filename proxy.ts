import { NextRequest, NextResponse } from "next/server";
import { defaultLocale, isLocale } from "@/i18n/config";
import { isCrossSiteRequest, isUnsafeMethod } from "@/services/api/origin-check";

export function proxy(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/api/")) {
    // Every state-changing BFF route gets the origin check here, so a new route cannot miss it.
    if (isUnsafeMethod(request.method) && isCrossSiteRequest(request)) {
      return NextResponse.json({ message: "Request origin was not accepted." }, { status: 403 });
    }
    return NextResponse.next();
  }

  const candidate = request.cookies.get("NEXT_LOCALE")?.value;
  const locale = isLocale(candidate) ? candidate : defaultLocale;
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-locale", locale);

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ["/api/:path*", "/((?!api|_next|_vercel|.*\\..*).*)"],
};
