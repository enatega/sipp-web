import "server-only";

const isProduction = process.env.NODE_ENV === "production";

/**
 * A required server variable. Development falls back to a local default; production
 * fails loudly instead of silently calling localhost (SEC-015). Read at request time so
 * `next build` never needs runtime secrets.
 */
export function requiredServerEnv(name: string, developmentFallback: string): string {
  const value = process.env[name]?.trim();
  if (value) return value;
  if (!isProduction) return developmentFallback;
  console.error(`[config] ${name} is not set; refusing to fall back to localhost in production.`);
  throw new Error(`${name} is not configured.`);
}

/** Like requiredServerEnv, but production logs and returns null so callers can degrade. */
export function optionalServerEnv(name: string, developmentFallback: string): string | null {
  const value = process.env[name]?.trim();
  if (value) return value;
  if (!isProduction) return developmentFallback;
  console.error(`[config] ${name} is not set in production.`);
  return null;
}
