import { ApiError } from "@/services/api/client";

/**
 * True when a lookup failed because the resource does not exist (404), or —
 * with `isBadIdMissing` — because the link carried an identifier the API
 * rejected as malformed (400). Retrying can never fix either case.
 */
export function isNotFoundError(error: unknown, { isBadIdMissing = false } = {}) {
  if (!(error instanceof ApiError)) return false;
  return error.status === 404 || (isBadIdMissing && error.status === 400);
}
