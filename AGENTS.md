<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# SIPP Super Web Agent Guide

This file is the mandatory entrypoint for every task in this repository. It
applies to the entire `super-web` tree. More specific `AGENTS.md` files may add
rules for a subtree, but may not weaken these rules.

## Read before changing code

Read the documents relevant to the task in this order:

1. [Product scope](.agents/PRODUCT.md) for scope and exclusions.
2. [Architecture](.agents/ARCHITECTURE.md) for boundaries and the target layout.
3. [Data fetching and state](.agents/data-fetching-and-state.md) for
   API, session, TanStack Query, and state work.
4. [UI, forms, and i18n](.agents/ui-forms-and-i18n.md) for components,
   styling, accessibility, Formik, Yup, themes, or translations.
5. [Quality and workflow](.agents/quality-and-workflow.md) for all
   implementation and review work.

When a task touches a version-sensitive Next.js API, read the matching guide
under `node_modules/next/dist/docs/` first. If dependencies are not installed,
do not guess: install them when authorized or consult official documentation.

## Product boundary

- The active commerce scope is Multi Vendor food delivery.
- Keep delivery-mode seams capable of supporting Single Vendor later.
- Keep module seams capable of supporting new services later.
- Do not implement Drive/Ride Sharing or Chain mode unless the task explicitly
  changes product scope.
- Preserve the existing homepage, authentication, profile, address, locale,
  and theme behavior while the target structure is adopted incrementally.

## Non-negotiable architecture rules

- Use Next.js App Router. Keep `app/` files thin: routing, metadata, layout,
  loading/error boundaries, and HTTP boundary orchestration only.
- New business code belongs in `modules/<module>/`; delivery code belongs in
  `modules/deliveries/`. Do not add feature logic to root-level `hooks/api/`
  or feature-named folders under `components/`.
- Keep independently owned route-level experiences in their own modules. The
  homepage belongs to `modules/home/`; future pages such as Partners or Offers
  belong to separate modules when they have independent content or behavior.
  Do not turn `home` into a container for unrelated pages. Related routes in
  one capability, such as profile and profile editing, stay in one module.
- A module may import public shared code, but may not import another module's
  internal files. Expose intentional public APIs from the owning module.
- Put base primitives in `components/ui/`. Put a composite in
  `components/shared/` only when it has real cross-module reuse.
- Browser code calls same-origin `/api/*` endpoints only. Never expose the
  upstream base URL or access token to a Client Component.
- Server-only API and session modules must import `server-only`.
- Use TanStack Query for remote client state. Do not mirror query data in
  Zustand, Context, or component state.
- Use Formik and Yup for submitted business forms. Use shared form primitives
  and the standard error-display policy.
- Put every user-facing string in `messages/en.json` and `messages/de.json`.
- Use semantic CSS/Tailwind tokens with complete light and dark values. Do not
  hardcode feature colors.
- Keep TypeScript strict. Do not use `any`, untyped API payloads, or unchecked
  casts at application boundaries.

## Naming and file conventions

- Folders: `kebab-case`.
- React component files and exports: `PascalCase.tsx` and `PascalCase`.
- Hooks and utilities: `camelCase.ts`; hooks start with `use`.
- Configuration and asset files: `kebab-case`.
- Boolean names: `is`, `has`, `can`, or `should` prefix.
- Local component props: `interface Props`. Reusable exported contracts use a
  descriptive name.
- Prefer named exports. Use default exports only where Next.js requires them.
- A component file exports one primary UI component. Extract secondary UI
  components rather than hiding them in a large file.
- Treat roughly 200 lines as a review signal, not a target. Split by behavior,
  not by arbitrary line count.
- Avoid broad barrel files. A module root may expose a small, deliberate public
  surface; internal folders must be imported directly within that module.

## Task workflow

1. Inspect current implementation, contracts, and nearby tests before editing.
2. Confirm the owning module and its public boundary before editing.
3. Make the smallest coherent change. Migrate by feature slice; do not combine
   a behavior change with an unrelated repository-wide reorganization.
4. Preserve unrelated work and existing behavior. Never overwrite user changes.
5. Add or update translations, loading/empty/error states, and tests with the
   implementation.
6. Run the checks required by
   [quality-and-workflow.md](.agents/quality-and-workflow.md).

## Completion checklist

- Boundaries and imports follow `.agents/ARCHITECTURE.md`.
- No upstream URL, secret, or bearer token is reachable by browser code.
- API inputs and outputs are typed; boundary input is validated.
- Query keys and cache invalidation use the owning module's key factory.
- Forms expose accessible labels and translated field/form errors.
- UI works with keyboard, mobile layouts, light mode, and dark mode.
- New user-facing strings exist in every configured locale.
- Loading, empty, offline, unauthorized, forbidden, rate-limit, timeout, and
  upstream-failure behavior is handled where applicable.
- Formatting, lint, i18n audit, build/type checks, and relevant tests pass, or
  the handoff states exactly which check could not run and why.
