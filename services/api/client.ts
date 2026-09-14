export class ApiError extends Error {
  readonly status: number;
  readonly code?: string;
  readonly fieldErrors?: Record<string, string>;

  constructor(
    message: string,
    status: number,
    options?: { code?: string; fieldErrors?: Record<string, string> },
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = options?.code;
    this.fieldErrors = options?.fieldErrors;
  }
}

const DEFAULT_TIMEOUT_MS = 15_000;
let intentionalLogout = false;

export function setIntentionalLogout(value: boolean) {
  intentionalLogout = value;
  if (value && typeof window !== "undefined") {
    window.dispatchEvent(new Event("shaanieol:intentional-logout"));
  }
}

type RequestOptions = RequestInit & { timeoutMs?: number };

export async function requestJson<T>(
  url: string,
  init?: RequestOptions,
): Promise<T> {
  if (!url.startsWith("/api/")) {
    throw new Error("Browser requests must use a same-origin server API route.");
  }

  const { timeoutMs = DEFAULT_TIMEOUT_MS, ...requestInit } = init ?? {};
  const timeoutController = new AbortController();
  const timeout = window.setTimeout(
    () => timeoutController.abort(new DOMException("Request timed out", "TimeoutError")),
    timeoutMs,
  );
  const signal = init?.signal
    ? AbortSignal.any([init.signal, timeoutController.signal])
    : timeoutController.signal;

  let response: Response;
  try {
    const browserTimezone =
      typeof Intl !== "undefined"
        ? Intl.DateTimeFormat().resolvedOptions().timeZone
        : undefined;
    response = await fetch(url, {
      ...requestInit,
      signal,
      headers: {
        ...(init?.body instanceof FormData
          ? {}
          : { "Content-Type": "application/json" }),
        ...(browserTimezone ? { "x-timezone": browserTimezone } : {}),
        ...init?.headers,
      },
    });
  } catch (error) {
    if (timeoutController.signal.aborted && !init?.signal?.aborted) {
      throw new ApiError("The request timed out. Please try again.", 408, {
        code: "REQUEST_TIMEOUT",
      });
    }
    throw error;
  } finally {
    window.clearTimeout(timeout);
  }
  const data = (await response.json().catch(() => ({}))) as T & {
    message?: string;
    code?: string;
    fieldErrors?: Record<string, string>;
  };

  if (!response.ok) {
    const expiredToken =
      response.status === 401 ||
      (response.status === 403 &&
        typeof data.message === "string" &&
        /token session expired|session expired|token expired/i.test(data.message));
    if (
      expiredToken &&
      !intentionalLogout &&
      !url.startsWith("/api/auth/") &&
      typeof window !== "undefined"
    ) {
      void fetch("/api/auth/logout", { method: "POST", credentials: "same-origin" });
      window.dispatchEvent(new CustomEvent("shaanieol:session-expired"));
    }
    throw new ApiError(
      data.message || "Something went wrong. Please try again.",
      response.status,
      { code: data.code, fieldErrors: data.fieldErrors },
    );
  }

  return data;
}

export function postJson<T>(url: string, payload?: unknown) {
  return requestJson<T>(url, {
    method: "POST",
    body: payload === undefined ? undefined : JSON.stringify(payload),
  });
}
