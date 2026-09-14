# Quality and Delivery Workflow

Apply these rules to every change, including agent-generated work.

## Before implementation

1. Read `AGENTS.md` and the linked documents relevant to the task.
2. Inspect the feature, types, backend/BFF contract, translations, and nearby
   tests. Do not infer a contract from UI mock data.
3. For version-sensitive Next.js behavior, read the installed Next.js 16 guide
   under `node_modules/next/dist/docs/` before coding.
4. Check `git status` and preserve unrelated user work.
5. Identify the owning module and confirm imports use its public boundary.

## Change discipline

- Make one coherent behavior change or migration slice at a time.
- Preserve existing user journeys during structural migrations.
- When moving code, update all imports and delete only the superseded copy.
- Do not perform speculative refactors, dependency upgrades, or formatting of
  unrelated files.
- Do not weaken lint, TypeScript, audit, accessibility, or test settings.
- Do not edit environment secrets. Document new variables in `sample.env`
  with safe placeholders and server/client exposure clearly marked.
- Comments explain a non-obvious reason or invariant, not syntax.
- Remove dead code, stale TODOs, debugging logs, and unused assets introduced
  or exposed by the change.

## Formatting and imports

The target formatter follows the admin conventions: Prettier, 80-column print
width, two spaces, semicolons, trailing commas, and single quotes except JSX
attributes. Imports are ordered as:

1. Node built-ins.
2. React and Next.js.
3. Third-party packages.
4. Shared aliases: types, config, lib, services, providers, and shared UI.
5. Owning module imports.
6. Relative imports and styles.

Until the formatter is installed in `super-web`, match the surrounding file
and do not manually reformat unrelated code. A future tooling change must add
one formatter configuration and a non-mutating CI check.

## Testing responsibilities

Tests are behavior contracts, not implementation snapshots.

- Unit tests cover pure mappers, query-key factories, validation schemas,
  cart/pricing rules, delivery-mode adapters, and error normalization.
- React Testing Library covers reusable primitives, form validation and server
  errors, theme/locale-sensitive UI, and important interactions.
- Playwright covers authentication, address selection, discovery/search,
  store/product, cart conflict, checkout/order placement, order status, and
  sign-out.
- Mock the network at the module/BFF boundary. Tests must not depend on a live
  backend or a developer's personal `.env`.
- Add a regression test for every fixed defect when a stable seam exists.
- Avoid snapshots for dynamic pages; use focused semantic assertions.

Vitest, React Testing Library, and Playwright are the target web test stack.
Until their harnesses are installed, do not claim test coverage that cannot
run; perform available checks and record the gap.

## Required runtime scenarios

For each touched remote feature, test applicable successful loading and
refresh, empty data, validation/backend errors, `401`, `403`, business
`409`, `429`, timeout, offline and `503` states, retry/cancellation,
duplicate submission prevention, responsive layouts, keyboard-only use,
light/dark themes, and both configured locales.

Cart and checkout changes additionally cover quantities, customizations,
store-conflict resolution, coupon rejection, fulfillment type, schedule,
notes, tip, payment failure, successful placement, and cache refresh.

## Completion commands

Run the checks supported by the current repository:

```bash
npm run lint
npm run i18n:audit:ci
npm run build
```

After the test and formatter harnesses are added, also run:

```bash
npm run format:check
npm run test
npm run test:e2e
```

During iteration, run the narrowest relevant test first, then the full required
suite. A production build is the TypeScript/Next.js integration check because
the project uses `noEmit`.

## Handoff standard

Report the user-visible outcome, important architecture/contract decisions,
checks and results, skipped checks and exact reasons, migrations/environment
or rollout concerns, and remaining work only when outside requested scope.

Do not report completion while required behavior is broken or generated
documentation contradicts implementation without clearly labeling the
target-state distinction.
