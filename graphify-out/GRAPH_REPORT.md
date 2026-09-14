# Graph Report - shaanieol-web  (2026-08-28)

## Corpus Check
- 133 files · ~312,085 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 604 nodes · 1102 edges · 27 communities (21 shown, 6 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 3 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `b0414399`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- hero-slides.tsx
- callApi
- PersonalInformation.tsx
- useAccountQueries.ts
- AddressBook.tsx
- types/index.ts
- Header.tsx
- dependencies
- devDependencies
- compilerOptions
- config.ts
- app/layout.tsx
- Super Web Architecture
- Data Fetching, State, Sessions, and Errors
- AGENTS.md
- Quality and Delivery Workflow
- UI, Forms, Styling, Themes, and Internationalization
- Shaaneiol Super Web Agent Guide
- Product
- audit.mjs
- Shaaneiol Super Web
- static/route.ts
- EagleCrest.tsx
- next.config.ts
- eslint.config.mjs
- postcss.config.mjs

## God Nodes (most connected - your core abstractions)
1. `callApi()` - 35 edges
2. `requireSession()` - 27 edges
3. `cn()` - 20 edges
4. `Icon()` - 16 edges
5. `compilerOptions` - 16 edges
6. `useSessionQuery()` - 15 edges
7. `callPublicApi()` - 15 edges
8. `AuthExperience()` - 12 edges
9. `LocationModal()` - 10 edges
10. `Data Fetching, State, Sessions, and Errors` - 9 edges

## Surprising Connections (you probably didn't know these)
- `POST()` --calls--> `callPublicApi()`  [EXTRACTED]
  app/api/auth/exists/route.ts → services/api/server.ts
- `POST()` --calls--> `clearSession()`  [EXTRACTED]
  app/api/auth/logout/route.ts → services/auth/session.ts
- `POST()` --calls--> `callPublicApi()`  [EXTRACTED]
  app/api/auth/phone/send/route.ts → services/api/server.ts
- `POST()` --calls--> `callPublicApi()`  [EXTRACTED]
  app/api/auth/signup/send/route.ts → services/api/server.ts
- `POST()` --calls--> `callApi()`  [EXTRACTED]
  app/api/maps/place-details/route.ts → services/api/server.ts

## Import Cycles
- None detected.

## Communities (27 total, 6 thin omitted)

### Community 0 - "hero-slides.tsx"
Cohesion: 0.05
Nodes (57): Icon(), IconName, PATHS, cn(), LINKS, EcosystemSlideView(), FloatingCards(), SPOT (+49 more)

### Community 1 - "callApi"
Cohesion: 0.06
Nodes (49): ADDITIONAL_KEYS, DELETE(), PATCH(), TYPES, PATCH(), ADDITIONAL_KEYS, dynamic, GET() (+41 more)

### Community 2 - "PersonalInformation.tsx"
Cohesion: 0.06
Nodes (39): metadata, metadata, metadata, metadata, readStoredPlace(), AccountMenu(), AuthMenu(), LocationTrigger() (+31 more)

### Community 3 - "useAccountQueries.ts"
Cohesion: 0.07
Nodes (37): metadata, AuthBrand(), AuthExperience(), composePhone(), isUnknownAccount(), OtpPurpose, View, CountrySelect() (+29 more)

### Community 4 - "AddressBook.tsx"
Cohesion: 0.07
Nodes (37): metadata, AddressPayload, locationApi, storePlace(), createLocationMarker(), DEFAULT_CENTER, InteractiveLocationMap(), InteractiveLocationMapProps (+29 more)

### Community 5 - "types/index.ts"
Cohesion: 0.09
Nodes (27): apiRoutes, authApi, paymentApi, profileApi, AddCardForm(), AddCardFormProps, AddCardModal(), Props (+19 more)

### Community 6 - "Header.tsx"
Cohesion: 0.07
Nodes (20): metadata, Footer(), SOCIALS, Header(), LAYOUT, Logo(), LogoProps, MARK (+12 more)

### Community 7 - "dependencies"
Cohesion: 0.06
Nodes (33): class-variance-authority, clsx, formik, lucide-react, next, next-intl, next-themes, dependencies (+25 more)

### Community 8 - "devDependencies"
Cohesion: 0.06
Nodes (30): eslint, eslint-config-next, devDependencies, eslint, eslint-config-next, tailwindcss, @tailwindcss/postcss, @types/node (+22 more)

### Community 9 - "compilerOptions"
Cohesion: 0.07
Nodes (28): dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules (+20 more)

### Community 10 - "config.ts"
Cohesion: 0.28
Nodes (10): LocaleSwitcher(), defaultLocale, isLocale(), Locale, localeNames, locales, getUserLocale(), setUserLocale() (+2 more)

### Community 11 - "app/layout.tsx"
Cohesion: 0.19
Nodes (8): cinzel, inter, metadata, poppins, themeConfig, AppProviders(), QueryProvider(), ThemeProvider()

### Community 12 - "Super Web Architecture"
Cohesion: 0.18
Nodes (11): `app/`, Current state versus target state, Delivery module design, Dependency direction, Layer responsibilities, `modules/`, Platform foundations, Server and client boundaries (+3 more)

### Community 13 - "Data Fetching, State, Sessions, and Errors"
Cohesion: 0.22
Nodes (9): Authentication failures, BFF route handlers, Browser API services, Data Fetching, State, Sessions, and Errors, Request paths, Server-only upstream client, State ownership, TanStack Query v5 (+1 more)

### Community 15 - "Quality and Delivery Workflow"
Cohesion: 0.25
Nodes (8): Before implementation, Change discipline, Completion commands, Formatting and imports, Handoff standard, Quality and Delivery Workflow, Required runtime scenarios, Testing responsibilities

### Community 16 - "UI, Forms, Styling, Themes, and Internationalization"
Cohesion: 0.25
Nodes (8): Accessibility, Component hierarchy, Form ownership, Internationalization, Required component states, Shared form primitives, Styling and tokens, UI, Forms, Styling, Themes, and Internationalization

### Community 17 - "Shaaneiol Super Web Agent Guide"
Cohesion: 0.29
Nodes (7): Completion checklist, Naming and file conventions, Non-negotiable architecture rules, Product boundary, Read before changing code, Shaaneiol Super Web Agent Guide, Task workflow

### Community 18 - "Product"
Cohesion: 0.29
Nodes (7): Brand, accessibility, and localization, Current product scope, Existing behavior to preserve, Expansion boundary, Platform and audience, Product, Product principles

### Community 19 - "audit.mjs"
Cohesion: 0.33
Nodes (4): catalogs, localeFiles, reference, root

### Community 20 - "Shaaneiol Super Web"
Cohesion: 0.40
Nodes (5): Current commands, Engineering documentation, Getting started, Security boundary, Shaaneiol Super Web

## Knowledge Gaps
- **193 isolated node(s):** `TYPES`, `ADDITIONAL_KEYS`, `dynamic`, `ADDITIONAL_KEYS`, `TYPES` (+188 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Icon()` connect `hero-slides.tsx` to `PersonalInformation.tsx`, `AddressBook.tsx`, `Header.tsx`?**
  _High betweenness centrality (0.058) - this node is a cross-community bridge._
- **What connects `TYPES`, `ADDITIONAL_KEYS`, `dynamic` to the rest of the system?**
  _193 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `hero-slides.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.05225718194254446 - nodes in this community are weakly interconnected._
- **Should `callApi` be split into smaller, more focused modules?**
  _Cohesion score 0.06354642313546423 - nodes in this community are weakly interconnected._
- **Should `PersonalInformation.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.057539682539682536 - nodes in this community are weakly interconnected._
- **Should `useAccountQueries.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07102040816326531 - nodes in this community are weakly interconnected._
- **Should `AddressBook.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.07358156028368794 - nodes in this community are weakly interconnected._