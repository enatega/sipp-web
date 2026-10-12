import type { NextRequest } from "next/server";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

export function isUnsafeMethod(method: string) {
  return !SAFE_METHODS.has(method.toUpperCase());
}

function firstHeaderValue(value: string | null) {
  return value?.split(",")[0]?.trim() || null;
}

// Origins this deployment answers on, including the public host when a TLS proxy forwards the request.
function acceptedOrigins(request: NextRequest) {
  const origins = new Set([request.nextUrl.origin]);
  const host = firstHeaderValue(request.headers.get("x-forwarded-host")) ?? request.headers.get("host");
  if (host) {
    const proto = firstHeaderValue(request.headers.get("x-forwarded-proto")) ?? request.nextUrl.protocol.replace(":", "");
    origins.add(`${proto}://${host}`);
  }
  return origins;
}

export function isCrossSiteRequest(request: NextRequest) {
  const fetchSite = request.headers.get("sec-fetch-site");
  if (fetchSite === "same-origin") return false;
  if (fetchSite === "cross-site") return true;

  const origin = request.headers.get("origin");
  if (origin) return !acceptedOrigins(request).has(origin);

  // A browser always sends Sec-Fetch-Site or Origin on a cross-site write; "same-site" alone is a sibling subdomain.
  return fetchSite === "same-site";
}
