const DEFAULT_RETURN_TO = "/discovery";

export function safeReturnTo(
  value: string | null | undefined,
  fallback = DEFAULT_RETURN_TO,
) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return fallback;
  }

  try {
    const url = new URL(value, "https://shaaneiol.local");
    if (url.origin !== "https://shaaneiol.local" || url.pathname === "/login") {
      return fallback;
    }
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return fallback;
  }
}

export function loginHref(returnTo: string) {
  return `/login?returnTo=${encodeURIComponent(safeReturnTo(returnTo))}`;
}
