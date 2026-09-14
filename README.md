# Shaaneiol Super Web

Customer-facing Next.js application for Shaaneiol. The current commerce scope
is Multi Vendor food delivery, with architecture that can add Single Vendor
and independent future service modules without coupling them to delivery
internals.

## Engineering documentation

Every developer and coding agent must start with [AGENTS.md](AGENTS.md).

- [Product scope](.agents/PRODUCT.md)
- [Architecture and module boundaries](.agents/ARCHITECTURE.md)
- [Data fetching, state, sessions, and errors](.agents/data-fetching-and-state.md)
- [UI, forms, styling, themes, and i18n](.agents/ui-forms-and-i18n.md)
- [Quality and workflow](.agents/quality-and-workflow.md)

The initial feature-first normalization is complete. The architecture document
defines the active module boundaries and the required extension points.

## Getting started

Install dependencies, copy the environment template, and point it at the
Shaaneiol backend:

Node.js 20.9 or newer is required by Next.js 16.

```bash
npm install
cp sample.env .env.local
```

Run the website on a port that does not conflict with the backend:

```bash
npm run dev -- --port 3001
```

Open [http://localhost:3001](http://localhost:3001). Customer authentication at
`/login` is proxied through same-origin `/api/auth/*` route handlers, and the
backend token remains in HTTP-only cookies.

Set `SHAANIEOL_PASSWORD_RESET_SECRET` to a unique random value of at least 32
characters in every production environment. It signs the short-lived,
HTTP-only grant issued only after a forgot-password OTP is verified.

## Current commands

```bash
npm run dev -- --port 3001
npm run lint
npm run i18n:audit
npm run i18n:audit:ci
npm run build
npm run start
```

Formatting, unit/component tests, and Playwright remain documented target
tooling; their scripts do not exist yet and are not listed as current commands.

## Security boundary

Client Components call same-origin `/api/*` endpoints only. Upstream backend
configuration, access tokens, and session-cookie logic remain in server-only
modules. Read the data-fetching guide before adding an endpoint or query.
