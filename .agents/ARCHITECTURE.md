# Super Web Architecture

This is the canonical target architecture for the SIPP customer web
application. It adapts the reusable patterns in `super-admin` to a secure,
customer-facing Next.js application and the modular delivery model in
`super-app`.

## Current state versus target state

The working homepage experience is owned by `modules/home/`; account,
authentication, profile, wallet, and address behavior is owned by
`modules/account/`. Multi Vendor discovery and the existing order screens are
owned by `modules/deliveries/`. Cross-module brand and shell components live
under `components/shared/`, root providers live under `providers/`, and
BFF/session transport remains under `app/api/` and `services/`.

The initial normalization is complete. New work must extend these boundaries
and must not reintroduce root-level feature components, `hooks/api`, or global
business types. Future migrations must preserve behavior and must not leave
duplicate implementations or competing conventions.

## Target directory layout

```text
app/                         # App Router entrypoints and HTTP boundaries
  (public)/                  # Public route group when needed
  (customer)/                # Authenticated customer route group when needed
  api/                       # Same-origin BFF route handlers
components/
  ui/                        # Accessible design-system primitives
  shared/                    # Proven cross-module composite UI
config/                      # Browser-safe static application configuration
.agents/                     # Detailed rules linked from root AGENTS.md
i18n/                        # next-intl request and locale configuration
lib/                         # Pure, application-wide utilities
messages/                    # Translation catalogs
modules/
  home/                      # Homepage sections, visuals, and page data
  account/                   # Auth, profile, wallet, addresses, preferences
  deliveries/                # Food-delivery business module
    api/                     # Browser-facing same-origin service functions
    components/              # Delivery UI grouped by feature
    hooks/                   # Queries, mutations, and UI/domain hooks
    modes/                   # Delivery-mode adapters and mode-specific UI
      multi-vendor/          # Active mode
      single-vendor/         # Future seam, not placeholder UI
    schemas/                 # Yup form schemas
    state/                   # Client-only state, never server cache data
    types/                   # Domain and API contracts owned by deliveries
    utils/                   # Pure delivery-domain functions
providers/                   # Root Query, theme, and i18n providers
services/
  api/                       # Server-only upstream client and normalization
  auth/                      # Server-only session/cookie behavior
types/                       # Truly cross-module contracts only
```

Create folders only when they have content. Do not add empty Single Vendor or
future-service scaffolding.

## Layer responsibilities

### `app/`

- Pages compose module-level screens and define metadata; they do not own
  business queries, mutation rules, schemas, or large UI trees.
- Layouts install shells and route-level providers.
- Add `loading.tsx`, `error.tsx`, and `not-found.tsx` at the narrowest useful
  segment.
- Route handlers authenticate, validate and normalize input, call a server
  service, and translate the upstream result into the web contract.
- Do not use route handlers as a generic open proxy.

### `modules/`

- A module owns its feature UI, public contracts, query keys, services,
  schemas, state, and domain utilities.
- An independently owned route-level experience gets its own module. For
  example, future Partners and Offers pages use `modules/partners/` and
  `modules/offers/`; they are not added to `modules/home/`.
- A route is not automatically a module boundary. Related screens belonging
  to one capability stay together, such as profile, profile editing, and
  preferences under `modules/account/`.
- `modules/home/` owns only the `/` experience. It may consume shared public
  components but must not become a catch-all public-pages folder.
- Internal imports stay inside the module. Other modules may import only the
  module's intentionally exported public API.
- A module must not know another module's folder layout.
- Cross-service platform capabilities such as account and addresses expose a
  stable public interface instead of being copied into delivery modules.

### Shared UI and utilities

- `components/ui/` holds accessible base controls such as Button, Input,
  Dialog, Select, Skeleton, and FormError.
- `components/shared/` holds composed UI used by at least two modules, such as
  an address picker or application shell.
- Reuse within one module stays in that module. Prematurely global components
  create coupling and are prohibited.
- `lib/` functions are pure and application-wide. Server access belongs in
  `services/`, not `lib/`.

## Delivery module design

Multi Vendor food delivery is the only active delivery mode. Its primary
journey is:

```text
address context -> discovery/search -> store -> product customization
-> cart/conflict resolution -> checkout/payment -> order lifecycle
-> tracking/chat -> rating/support
```

Shared delivery capabilities depend on a small mode contract rather than
checking mode strings throughout the UI. The contract may provide discovery
sections, navigation labels, catalog entry behavior, and supported
capabilities. Multi Vendor supplies the first implementation. A future Single
Vendor adapter must be addable without replacing address, product, cart,
checkout, order, profile, or shell contracts.

Chain mode and Drive/Ride Sharing are out of scope. Do not add speculative
adapters, routes, data models, or UI for them.

## Dependency direction

Allowed dependency direction:

```text
app -> modules -> shared components/lib/types
app/api -> server services -> backend
module client hooks -> module API service -> same-origin app/api
```

Prohibited dependencies:

- Client Component to `services/` or any `server-only` file.
- Browser request to the upstream backend URL.
- Shared component to a business module.
- One business module to another module's internal path.
- Presentation component directly to `fetch`, Axios, cookies, or storage.
- Global state store duplicating TanStack Query response data.

Use `import type` for type-only imports. Avoid circular dependencies and
barrel chains. Module-local relative imports are acceptable; cross-layer
imports use the `@/` alias.

## Server and client boundaries

Prefer Server Components for static or request-time render data that does not
need browser interaction. A Server Component calls a server-only service
directly; it does not make an HTTP request back to its own `/api` route.

Use Client Components only for interaction, browser APIs, live client state,
or TanStack Query behavior. Keep the `"use client"` boundary as low as
practical. Client code calls a typed module API service, which calls `/api/*`.

The upstream base URL, bearer token, session decoding, and privileged headers
exist only in server-only modules. Session credentials remain in secure,
HTTP-only cookies. See
[data-fetching-and-state.md](data-fetching-and-state.md).

## Platform foundations

- Next.js App Router is the routing and rendering framework.
- `next-intl` owns locale resolution and user-visible messages.
- `next-themes` owns system/light/dark selection and persistence.
- Tailwind CSS 4 consumes semantic CSS variables from global styles.
- TanStack Query v5 owns remote client state.
- Formik and Yup own submitted business-form state and validation.
- Zustand is permitted only for complex client-only state that must survive
  across unrelated component branches and is not server-owned data.

TanStack Query, Formik, Yup, the root Query provider, and shared class-merging
utilities are installed foundations. Reuse them rather than introducing a
second data or form pattern.
