import { isIP } from "node:net";
import { NextResponse } from "next/server";

const countryCodePattern = /^[A-Z]{2}$/;

function countryFromHeaders(request: Request) {
  for (const header of ["x-vercel-ip-country", "cf-ipcountry"]) {
    const value = request.headers.get(header)?.toUpperCase() ?? "";
    if (countryCodePattern.test(value) && value !== "XX") return value;
  }
  return null;
}

export async function GET(request: Request) {
  const knownCountry = countryFromHeaders(request);
  if (knownCountry) return NextResponse.json({ country: knownCountry });

  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = forwarded || request.headers.get("cf-connecting-ip") || request.headers.get("x-real-ip");
  if (!ip || !isIP(ip)) return NextResponse.json({ country: null });

  try {
    const response = await fetch(`https://ipinfo.io/${encodeURIComponent(ip)}/json`, {
      cache: "no-store",
      signal: AbortSignal.timeout(2_500),
    });
    if (!response.ok) return NextResponse.json({ country: null });
    const payload = (await response.json()) as { country?: unknown };
    const country = typeof payload.country === "string" ? payload.country.toUpperCase() : "";
    return NextResponse.json({ country: countryCodePattern.test(country) ? country : null });
  } catch {
    return NextResponse.json({ country: null });
  }
}
