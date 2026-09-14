# Data Fetching, State, Sessions, and Errors

These rules define the target data architecture. The current same-origin BFF
and HTTP-only session model is the security baseline and must be preserved.

## Request paths

Use one of two paths:

```text
Server Component -> server-only service -> upstream backend
Client Component -> TanStack hook -> module API service -> /api/* -> server-only service -> upstream backend
```

- Browser code must never know or call the upstream base URL.
- Browser code must never read, store, or attach the access token.
- Do not call the application's own `/api` endpoint from a Server Component.
- Do not call `fetch` or Axios from a presentation component.
- Route handlers are explicit BFF endpoints, not a catch-all backend proxy.

## Server-only upstream client

The shared upstream client must:

- import `server-only`;
- read the base URL from server environment configuration;
- obtain authentication from the HTTP-only session cookie;
- set JSON and timezone headers consistently;
- apply a bounded timeout and cancellation;
- parse empty and non-JSON responses safely;
- normalize backend errors into one typed error contract;
- never log access tokens, passwords, OTP values, payment data, or full PII;
- use explicit cache semantics instead of framework defaults.

Server services own backend paths and backend-specific wire shapes. A Server
Component receives an application contract, not an unvalidated Axios/Fetch
response.

## BFF route handlers

Each route handler must:

1. Authenticate when the operation is protected.
2. Parse input defensively and validate path, query, and body values.
3. Whitelist fields forwarded upstream; never spread arbitrary browser input.
4. Call the relevant server service.
5. Return a stable, minimal web response and appropriate HTTP status.

Use `400` for invalid input, `401` for an absent/invalid session, `403` for
a valid session without permission, `404` for a missing resource, `409` for
a business conflict, `422` for semantically invalid data when the backend
uses it, `429` for throttling, and `503` for an unavailable dependency.
Preserve a more specific safe upstream status when appropriate.

Never return backend stack traces, database details, secret headers, or raw
unknown payloads. Validation text rendered to users comes from the client
translation catalog; route-handler messages are safe machine/API fallbacks.

## Browser API services

Each module owns small typed service functions under `modules/<module>/api/`.
They may call same-origin `/api/*` URLs only and should:

- accept typed input rather than positional parameter lists when a request has
  multiple fields;
- serialize query parameters with `URLSearchParams`;
- accept an `AbortSignal` for cancellable reads;
- return parsed domain/API data, not a raw `Response`;
- throw the standard `ApiError` for non-success responses.

The standard error shape is:

```ts
type ApiErrorCode =
  | 'validation'
  | 'unauthorized'
  | 'forbidden'
  | 'not-found'
  | 'conflict'
  | 'rate-limited'
  | 'timeout'
  | 'offline'
  | 'unavailable'
  | 'unknown';

class ApiError extends Error {
  status: number;
  code: ApiErrorCode;
  fieldErrors?: Record<string, string>;
  details?: unknown;
}
```

`message` is a safe fallback, not the primary localization mechanism.

## TanStack Query v5

Remote server state belongs to TanStack Query. Every module owns exactly one
hierarchical query-key factory:

```ts
export const deliveryKeys = {
  all: ['deliveries'] as const,
  discovery: () => [...deliveryKeys.all, 'discovery'] as const,
  stores: (filters: StoreFilters) =>
    [...deliveryKeys.discovery(), 'stores', filters] as const,
  store: (storeId: string) =>
    [...deliveryKeys.all, 'store', storeId] as const,
  cart: () => [...deliveryKeys.all, 'cart'] as const,
};
```

- Never write ad hoc array keys in components.
- Include every value that changes the query result in the key.
- Normalize optional filters before using them in keys or URLs.
- Query functions live in hooks/options factories and call module API services.
- Pass TanStack's `signal` to read requests.
- Set `enabled` for queries requiring an ID, session, or selected address.
- Choose `staleTime` by domain volatility; do not copy one global value.
- Disable focus refetch only with a domain reason.
- Paginated contracts expose items plus pagination metadata.
- Mutations declare exact affected keys. Prefer returned-data cache updates for
  cart operations and targeted invalidation for broader derived data.
- Optimistic updates require rollback, conflict handling, and a test.

The root Query provider owns global defaults and devtools. Components consume
query and mutation state; they do not create parallel loading flags for the
same request.

## State ownership

- TanStack Query: backend-owned, asynchronous data.
- Formik: submitted form values, touched state, and form errors.
- URL search parameters: shareable search, sort, filter, pagination, and tabs.
- Local component state: ephemeral UI such as an open dialog.
- Context: stable feature coordination with a naturally bounded provider.
- Zustand: complex cross-tree client-only state, never a copy of profile, cart,
  stores, or orders returned by the backend.
- Cookies: server-managed session and locale preferences.
- Local storage: non-sensitive preferences only; access defensively and never
  during server rendering.

Selected delivery address is a cross-feature input. Persist only the minimal
identifier/coordinates needed by product behavior and invalidate
address-dependent discovery, fees, and checkout queries when it changes.

## Authentication failures

- An absent session yields `401` and a sign-in recovery path.
- A valid but unauthorized customer yields `403`; do not silently log out.
- Only a confirmed rejected/expired credential clears the session.
- A network failure, backend `5xx`, business `403`, or missing proxy header
  must not erase authentication state.
- Redirects preserve a safe same-origin return path.

## User-facing failure states

Every remote feature defines applicable behavior for initial loading,
background refresh, an empty result, offline/network failure, unauthenticated
or forbidden access, validation/business conflict, throttling, timeout,
upstream unavailability, and an unexpected failure with a safe recovery action.

Log technical context only on the server or through approved telemetry.
User messages are translated, actionable, and free of implementation details.
