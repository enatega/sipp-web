<div align="center">

# 🛡️ sipp-web — Security, Performance & Code Quality Audit

![Findings: 39](https://img.shields.io/badge/Findings-39-24292E?style=flat-square) ![Critical: 1](https://img.shields.io/badge/Critical-1-B60205?style=flat-square) ![High: 6](https://img.shields.io/badge/High-6-D93F0B?style=flat-square) ![Medium: 16](https://img.shields.io/badge/Medium-16-FBCA04?style=flat-square) ![Low: 16](https://img.shields.io/badge/Low-16-0E8A16?style=flat-square) ![Status: Report only — no fixes applied](https://img.shields.io/badge/Status-Report%20only%20%E2%80%94%20no%20fixes%20applied-555555?style=flat-square)

**Audit date:** 2026-10-09 · **Branch:** `audit/security-performance-fixes` · **Scope:** `sipp-web` (backend facts cross-checked read-only in `sipp-server`)

🖥️ **Interactive report:** [https://claude.ai/artifact/BXs8bnx1mij5Zx131pZncg](https://claude.ai/artifact/BXs8bnx1mij5Zx131pZncg) · 📄 **Claude Doc:** [https://claude.ai/code/artifact/9a30d474-5327-4dec-8cd7-4f0a8fee606a](https://claude.ai/code/artifact/9a30d474-5327-4dec-8cd7-4f0a8fee606a)

</div>

---

## 📑 Contents

1. [Executive summary](#-executive-summary)
2. [Legend](#-legend)
3. [Architecture](#-architecture)
4. [Baseline checks](#-baseline-checks)
5. [Findings index](#-findings-index)
6. [Critical findings](#-critical-findings)
7. [High findings](#-high-findings)
8. [Medium findings](#-medium-findings)
9. [Low findings](#-low-findings)
10. [Manual actions and decisions](#-manual-actions-and-decisions)
11. [Recommended follow-ups](#-recommended-follow-ups)

---

## 📊 Executive summary

There are **39 open findings**. Nothing has been fixed yet; this is a report only. The most urgent items are the vulnerable Next.js version, the access token exposed to browser JavaScript, and a shared upstream rate limit that can lock every web customer out of OTP flows.

| Priority | ![Type: Security](https://img.shields.io/badge/Type-Security-8B0000?style=flat-square) | ![Type: Performance](https://img.shields.io/badge/Type-Performance-1D76DB?style=flat-square) | ![Type: Quality](https://img.shields.io/badge/Type-Quality-5319E7?style=flat-square) | **Total** |
|---|:---:|:---:|:---:|:---:|
| 🔴 ![Priority: Critical](https://img.shields.io/badge/Priority-Critical-B60205?style=flat-square) | 1 | 0 | 0 | **1** |
| 🟠 ![Priority: High](https://img.shields.io/badge/Priority-High-D93F0B?style=flat-square) | 5 | 1 | 0 | **6** |
| 🟡 ![Priority: Medium](https://img.shields.io/badge/Priority-Medium-FBCA04?style=flat-square) | 8 | 4 | 4 | **16** |
| 🟢 ![Priority: Low](https://img.shields.io/badge/Priority-Low-0E8A16?style=flat-square) | 7 | 3 | 6 | **16** |
| **Total** | **21** | **8** | **10** | **39** |

### 🎯 Top 5 risks

| # | ID | Priority | Risk |
|:-:|---|---|---|
| 1 | [SEC-001](#sec-001) | ![Priority: Critical](https://img.shields.io/badge/Priority-Critical-B60205?style=flat-square) | `next@16.3.2` has published RCE, SSRF and cache-poisoning advisories, and the image optimizer is in use. |
| 2 | [SEC-006](#sec-006) | ![Priority: High](https://img.shields.io/badge/Priority-High-D93F0B?style=flat-square) | `/socket-session` returns the raw 30-day JWT to browser JS, so any XSS becomes an account takeover. |
| 3 | [PERF-001](#perf-001) | ![Priority: High](https://img.shields.io/badge/Priority-High-D93F0B?style=flat-square) | Client IP is not forwarded, so all web users share one upstream throttle (12 OTP per 5 min, 80 req/min). |
| 4 | [SEC-003](#sec-003) | ![Priority: High](https://img.shields.io/badge/Priority-High-D93F0B?style=flat-square) | No CSP, anti-framing or HSTS headers, so checkout, wallet and account deletion can be clickjacked. |
| 5 | [SEC-002](#sec-002) | ![Priority: High](https://img.shields.io/badge/Priority-High-D93F0B?style=flat-square) | About 50 mutating routes skip the origin check, allowing login CSRF and same-site CSRF. |

---

## 🏷️ Legend

| Priority | Meaning |
|---|---|
| 🔴 ![Priority: Critical](https://img.shields.io/badge/Priority-Critical-B60205?style=flat-square) | Exploitable now, or causes data loss or an outage. Fix immediately. |
| 🟠 ![Priority: High](https://img.shields.io/badge/Priority-High-D93F0B?style=flat-square) | Serious risk or major performance degradation. |
| 🟡 ![Priority: Medium](https://img.shields.io/badge/Priority-Medium-FBCA04?style=flat-square) | Noticeable weakness or inefficiency. |
| 🟢 ![Priority: Low](https://img.shields.io/badge/Priority-Low-0E8A16?style=flat-square) | Best practice, cleanup or a minor gain. |

| Type | Covers |
|---|---|
| ![Type: Security](https://img.shields.io/badge/Type-Security-8B0000?style=flat-square) | Auth, access control, injection, CSRF/XSS, headers, secrets, dependencies |
| ![Type: Performance](https://img.shields.io/badge/Type-Performance-1D76DB?style=flat-square) | Rendering strategy, caching, payloads, polling, connections, Core Web Vitals |
| ![Type: Quality](https://img.shields.io/badge/Type-Quality-5319E7?style=flat-square) | Reliability, error handling, type safety, tests, maintainability, accessibility |

Effort: ![Effort: Small](https://img.shields.io/badge/Effort-Small-C2E0C6?style=flat-square) under a day · ![Effort: Medium](https://img.shields.io/badge/Effort-Medium-FEF2C0?style=flat-square) 1–3 days · ![Effort: Large](https://img.shields.io/badge/Effort-Large-F9D0C4?style=flat-square) more than 3 days, or cross-team.
Status: ![Status: Open](https://img.shields.io/badge/Status-Open-555555?style=flat-square) not yet addressed · ![Status: Unverified](https://img.shields.io/badge/Status-Unverified-6A737D?style=flat-square) cannot be confirmed from code alone.

---

## 🏗️ Architecture

- **Stack:** Next.js 16.3.2 (App Router, webpack), React 19.2, TypeScript strict, Tailwind 4, next-intl (en, de, es, ar, fr), TanStack Query 5, Formik + Yup.
- **Shape:** a customer storefront for SIPP multi-vendor food delivery. Pages are thin, and 128 `"use client"` components fetch data after hydration.
- **Backend boundary:** no database. About 100 route handlers under `app/api/*` form a same-origin BFF that proxies to the NestJS `sipp-server` through `services/api/server.ts`.
- **Auth:** the upstream JWT is in an httpOnly cookie `shaaneiol_access_token`, next to an unsigned base64 `shaaneiol_user` cookie (SameSite=Lax, 30 days). Password reset uses an HMAC-signed 10-minute cookie. Admin impersonation exchanges a token passed in the URL.
- **Integrations:** Stripe Elements, Google Maps / Places / Static Maps, Google Identity, socket.io (orders, notifications, support), ipinfo.io.
- **Edge:** `proxy.ts` only sets the locale header. `next.config.ts` sets headers for a single route.
- **Missing:** Dockerfile, CI, test runner, `.env.example`.

---

## ✅ Baseline checks

| Check | Result |
|---|---|
| `tsc --noEmit` | ![tsc: pass](https://img.shields.io/badge/tsc-pass-2EA44F?style=flat-square) |
| `eslint .` | ![eslint: 4 errors · 14 warnings](https://img.shields.io/badge/eslint-4%20errors%20%C2%B7%2014%20warnings-D93F0B?style=flat-square) |
| `npm audit` | ![npm audit: 1 critical · 2 high](https://img.shields.io/badge/npm%20audit-1%20critical%20%C2%B7%202%20high-B60205?style=flat-square) |
| Tests | ![tests: none configured](https://img.shields.io/badge/tests-none%20configured-6A737D?style=flat-square) |
| `.env` in git history | ![.env: never committed](https://img.shields.io/badge/.env-never%20committed-2EA44F?style=flat-square) (git-ignored; verified with `git log --all -- .env`) |
| Build | Not run (report-only audit) |

---

## 🗂️ Findings index

| ID | Priority | Type | Title | Effort | Status |
|---|---|---|---|---|---|
| [SEC-001](#sec-001) | ![Priority: Critical](https://img.shields.io/badge/Priority-Critical-B60205?style=flat-square) | ![Type: Security](https://img.shields.io/badge/Type-Security-8B0000?style=flat-square) | Vulnerable Next.js version (RCE / SSRF / cache poisoning) | ![Effort: Small](https://img.shields.io/badge/Effort-Small-C2E0C6?style=flat-square) | ![Status: Open](https://img.shields.io/badge/Status-Open-555555?style=flat-square) |
| [SEC-002](#sec-002) | ![Priority: High](https://img.shields.io/badge/Priority-High-D93F0B?style=flat-square) | ![Type: Security](https://img.shields.io/badge/Type-Security-8B0000?style=flat-square) | ~50 state-changing BFF routes have no CSRF / origin check | ![Effort: Small](https://img.shields.io/badge/Effort-Small-C2E0C6?style=flat-square) | ![Status: Open](https://img.shields.io/badge/Status-Open-555555?style=flat-square) |
| [SEC-003](#sec-003) | ![Priority: High](https://img.shields.io/badge/Priority-High-D93F0B?style=flat-square) | ![Type: Security](https://img.shields.io/badge/Type-Security-8B0000?style=flat-square) | No security headers (CSP, anti-framing, HSTS, nosniff) | ![Effort: Small](https://img.shields.io/badge/Effort-Small-C2E0C6?style=flat-square) | ![Status: Open](https://img.shields.io/badge/Status-Open-555555?style=flat-square) |
| [SEC-004](#sec-004) | ![Priority: High](https://img.shields.io/badge/Priority-High-D93F0B?style=flat-square) | ![Type: Security](https://img.shields.io/badge/Type-Security-8B0000?style=flat-square) | Path traversal into upstream API via unvalidated route params | ![Effort: Small](https://img.shields.io/badge/Effort-Small-C2E0C6?style=flat-square) | ![Status: Open](https://img.shields.io/badge/Status-Open-555555?style=flat-square) |
| [PERF-001](#perf-001) | ![Priority: High](https://img.shields.io/badge/Priority-High-D93F0B?style=flat-square) | ![Type: Performance](https://img.shields.io/badge/Type-Performance-1D76DB?style=flat-square) | Client IP not forwarded: all web users share one upstream rate-limit bucket | ![Effort: Small](https://img.shields.io/badge/Effort-Small-C2E0C6?style=flat-square) | ![Status: Open](https://img.shields.io/badge/Status-Open-555555?style=flat-square) |
| [SEC-005](#sec-005) | ![Priority: High](https://img.shields.io/badge/Priority-High-D93F0B?style=flat-square) | ![Type: Security](https://img.shields.io/badge/Type-Security-8B0000?style=flat-square) | Account enumeration endpoint with no rate limit | ![Effort: Small–Medium](https://img.shields.io/badge/Effort-Small%E2%80%93Medium-C2E0C6?style=flat-square) | ![Status: Open](https://img.shields.io/badge/Status-Open-555555?style=flat-square) |
| [SEC-006](#sec-006) | ![Priority: High](https://img.shields.io/badge/Priority-High-D93F0B?style=flat-square) | ![Type: Security](https://img.shields.io/badge/Type-Security-8B0000?style=flat-square) | Raw access token (JWT) returned to browser JavaScript | ![Effort: Large](https://img.shields.io/badge/Effort-Large-F9D0C4?style=flat-square) | ![Status: Open](https://img.shields.io/badge/Status-Open-555555?style=flat-square) |
| [SEC-007](#sec-007) | ![Priority: Medium](https://img.shields.io/badge/Priority-Medium-FBCA04?style=flat-square) | ![Type: Security](https://img.shields.io/badge/Type-Security-8B0000?style=flat-square) | Unvalidated request bodies spread into upstream calls | ![Effort: Small](https://img.shields.io/badge/Effort-Small-C2E0C6?style=flat-square) | ![Status: Open](https://img.shields.io/badge/Status-Open-555555?style=flat-square) |
| [SEC-008](#sec-008) | ![Priority: Medium](https://img.shields.io/badge/Priority-Medium-FBCA04?style=flat-square) | ![Type: Security](https://img.shields.io/badge/Type-Security-8B0000?style=flat-square) | Raw query strings forwarded upstream | ![Effort: Small](https://img.shields.io/badge/Effort-Small-C2E0C6?style=flat-square) | ![Status: Open](https://img.shields.io/badge/Status-Open-555555?style=flat-square) |
| [SEC-009](#sec-009) | ![Priority: Medium](https://img.shields.io/badge/Priority-Medium-FBCA04?style=flat-square) | ![Type: Security](https://img.shields.io/badge/Type-Security-8B0000?style=flat-square) | Session cookie lifetime decoupled from JWT; no revocation on logout | ![Effort: Small](https://img.shields.io/badge/Effort-Small-C2E0C6?style=flat-square) | ![Status: Open](https://img.shields.io/badge/Status-Open-555555?style=flat-square) |
| [SEC-010](#sec-010) | ![Priority: Medium](https://img.shields.io/badge/Priority-Medium-FBCA04?style=flat-square) | ![Type: Security](https://img.shields.io/badge/Type-Security-8B0000?style=flat-square) | Support attachment upload trusts client-declared MIME type | ![Effort: Small](https://img.shields.io/badge/Effort-Small-C2E0C6?style=flat-square) | ![Status: Open](https://img.shields.io/badge/Status-Open-555555?style=flat-square) |
| [SEC-011](#sec-011) | ![Priority: Medium](https://img.shields.io/badge/Priority-Medium-FBCA04?style=flat-square) | ![Type: Security](https://img.shields.io/badge/Type-Security-8B0000?style=flat-square) | Order-chat attachment URLs not scheme-restricted | ![Effort: Small](https://img.shields.io/badge/Effort-Small-C2E0C6?style=flat-square) | ![Status: Open](https://img.shields.io/badge/Status-Open-555555?style=flat-square) |
| [SEC-012](#sec-012) | ![Priority: Medium](https://img.shields.io/badge/Priority-Medium-FBCA04?style=flat-square) | ![Type: Security](https://img.shields.io/badge/Type-Security-8B0000?style=flat-square) | SSE stream leaks internal socket origin and error text | ![Effort: Small](https://img.shields.io/badge/Effort-Small-C2E0C6?style=flat-square) | ![Status: Open](https://img.shields.io/badge/Status-Open-555555?style=flat-square) |
| [SEC-013](#sec-013) | ![Priority: Medium](https://img.shields.io/badge/Priority-Medium-FBCA04?style=flat-square) | ![Type: Security](https://img.shields.io/badge/Type-Security-8B0000?style=flat-square) | Impersonation token delivered in URL query string | ![Effort: Small](https://img.shields.io/badge/Effort-Small-C2E0C6?style=flat-square) | ![Status: Open](https://img.shields.io/badge/Status-Open-555555?style=flat-square) |
| [SEC-014](#sec-014) | ![Priority: Medium](https://img.shields.io/badge/Priority-Medium-FBCA04?style=flat-square) | ![Type: Security](https://img.shields.io/badge/Type-Security-8B0000?style=flat-square) | Unauthenticated proxies to paid Google APIs | ![Effort: Small](https://img.shields.io/badge/Effort-Small-C2E0C6?style=flat-square) | ![Status: Open](https://img.shields.io/badge/Status-Open-555555?style=flat-square) |
| [PERF-002](#perf-002) | ![Priority: Medium](https://img.shields.io/badge/Priority-Medium-FBCA04?style=flat-square) | ![Type: Performance](https://img.shields.io/badge/Type-Performance-1D76DB?style=flat-square) | 5-second order polling continues in background tabs | ![Effort: Small](https://img.shields.io/badge/Effort-Small-C2E0C6?style=flat-square) | ![Status: Open](https://img.shields.io/badge/Status-Open-555555?style=flat-square) |
| [QUAL-001](#qual-001) | ![Priority: Medium](https://img.shields.io/badge/Priority-Medium-FBCA04?style=flat-square) | ![Type: Quality](https://img.shields.io/badge/Type-Quality-5319E7?style=flat-square) | ESLint errors (React hooks rules) | ![Effort: Small](https://img.shields.io/badge/Effort-Small-C2E0C6?style=flat-square) | ![Status: Open](https://img.shields.io/badge/Status-Open-555555?style=flat-square) |
| [QUAL-002](#qual-002) | ![Priority: Medium](https://img.shields.io/badge/Priority-Medium-FBCA04?style=flat-square) | ![Type: Quality](https://img.shields.io/badge/Type-Quality-5319E7?style=flat-square) | Arabic locale shipped without RTL direction | ![Effort: Small](https://img.shields.io/badge/Effort-Small-C2E0C6?style=flat-square) | ![Status: Open](https://img.shields.io/badge/Status-Open-555555?style=flat-square) |
| [PERF-003](#perf-003) | ![Priority: Medium](https://img.shields.io/badge/Priority-Medium-FBCA04?style=flat-square) | ![Type: Performance](https://img.shields.io/badge/Type-Performance-1D76DB?style=flat-square) | Store and product images bypass optimization | ![Effort: Medium](https://img.shields.io/badge/Effort-Medium-FEF2C0?style=flat-square) | ![Status: Open](https://img.shields.io/badge/Status-Open-555555?style=flat-square) |
| [PERF-004](#perf-004) | ![Priority: Medium](https://img.shields.io/badge/Priority-Medium-FBCA04?style=flat-square) | ![Type: Performance](https://img.shields.io/badge/Type-Performance-1D76DB?style=flat-square) | Public data fetched with `no-store` on every request | ![Effort: Medium](https://img.shields.io/badge/Effort-Medium-FEF2C0?style=flat-square) | ![Status: Open](https://img.shields.io/badge/Status-Open-555555?style=flat-square) |
| [QUAL-003](#qual-003) | ![Priority: Medium](https://img.shields.io/badge/Priority-Medium-FBCA04?style=flat-square) | ![Type: Quality](https://img.shields.io/badge/Type-Quality-5319E7?style=flat-square) | No error / not-found boundaries | ![Effort: Medium](https://img.shields.io/badge/Effort-Medium-FEF2C0?style=flat-square) | ![Status: Open](https://img.shields.io/badge/Status-Open-555555?style=flat-square) |
| [QUAL-004](#qual-004) | ![Priority: Medium](https://img.shields.io/badge/Priority-Medium-FBCA04?style=flat-square) | ![Type: Quality](https://img.shields.io/badge/Type-Quality-5319E7?style=flat-square) | No automated tests or CI pipeline | ![Effort: Medium](https://img.shields.io/badge/Effort-Medium-FEF2C0?style=flat-square) | ![Status: Open](https://img.shields.io/badge/Status-Open-555555?style=flat-square) |
| [PERF-005](#perf-005) | ![Priority: Medium](https://img.shields.io/badge/Priority-Medium-FBCA04?style=flat-square) | ![Type: Performance](https://img.shields.io/badge/Type-Performance-1D76DB?style=flat-square) | Client-only rendering for SEO-critical pages | ![Effort: Large](https://img.shields.io/badge/Effort-Large-F9D0C4?style=flat-square) | ![Status: Open](https://img.shields.io/badge/Status-Open-555555?style=flat-square) |
| [SEC-015](#sec-015) | ![Priority: Low](https://img.shields.io/badge/Priority-Low-0E8A16?style=flat-square) | ![Type: Security](https://img.shields.io/badge/Type-Security-8B0000?style=flat-square) | Localhost fallbacks for required env vars | ![Effort: Small](https://img.shields.io/badge/Effort-Small-C2E0C6?style=flat-square) | ![Status: Open](https://img.shields.io/badge/Status-Open-555555?style=flat-square) |
| [SEC-016](#sec-016) | ![Priority: Low](https://img.shields.io/badge/Priority-Low-0E8A16?style=flat-square) | ![Type: Security](https://img.shields.io/badge/Type-Security-8B0000?style=flat-square) | Unvalidated redirect to upstream checkout URL | ![Effort: Small](https://img.shields.io/badge/Effort-Small-C2E0C6?style=flat-square) | ![Status: Open](https://img.shields.io/badge/Status-Open-555555?style=flat-square) |
| [SEC-017](#sec-017) | ![Priority: Low](https://img.shields.io/badge/Priority-Low-0E8A16?style=flat-square) | ![Type: Security](https://img.shields.io/badge/Type-Security-8B0000?style=flat-square) | Contact form lacks format and length validation | ![Effort: Small](https://img.shields.io/badge/Effort-Small-C2E0C6?style=flat-square) | ![Status: Open](https://img.shields.io/badge/Status-Open-555555?style=flat-square) |
| [SEC-018](#sec-018) | ![Priority: Low](https://img.shields.io/badge/Priority-Low-0E8A16?style=flat-square) | ![Type: Security](https://img.shields.io/badge/Type-Security-8B0000?style=flat-square) | Identity read from unsigned user cookie (informational) | ![Effort: Small](https://img.shields.io/badge/Effort-Small-C2E0C6?style=flat-square) | ![Status: Open](https://img.shields.io/badge/Status-Open-555555?style=flat-square) |
| [SEC-019](#sec-019) | ![Priority: Low](https://img.shields.io/badge/Priority-Low-0E8A16?style=flat-square) | ![Type: Security](https://img.shields.io/badge/Type-Security-8B0000?style=flat-square) | Password-reset grant is replayable within its TTL | ![Effort: Small](https://img.shields.io/badge/Effort-Small-C2E0C6?style=flat-square) | ![Status: Unverified](https://img.shields.io/badge/Status-Unverified-6A737D?style=flat-square) |
| [SEC-020](#sec-020) | ![Priority: Low](https://img.shields.io/badge/Priority-Low-0E8A16?style=flat-square) | ![Type: Security](https://img.shields.io/badge/Type-Security-8B0000?style=flat-square) | Public Google Maps key restrictions not verifiable | ![Effort: Small](https://img.shields.io/badge/Effort-Small-C2E0C6?style=flat-square) | ![Status: Unverified](https://img.shields.io/badge/Status-Unverified-6A737D?style=flat-square) |
| [SEC-021](#sec-021) | ![Priority: Low](https://img.shields.io/badge/Priority-Low-0E8A16?style=flat-square) | ![Type: Security](https://img.shields.io/badge/Type-Security-8B0000?style=flat-square) | Visitor IP sent to third-party geo service | ![Effort: Small](https://img.shields.io/badge/Effort-Small-C2E0C6?style=flat-square) | ![Status: Open](https://img.shields.io/badge/Status-Open-555555?style=flat-square) |
| [PERF-006](#perf-006) | ![Priority: Low](https://img.shields.io/badge/Priority-Low-0E8A16?style=flat-square) | ![Type: Performance](https://img.shields.io/badge/Type-Performance-1D76DB?style=flat-square) | Raw `<img>` without dimensions or lazy loading | ![Effort: Small](https://img.shields.io/badge/Effort-Small-C2E0C6?style=flat-square) | ![Status: Open](https://img.shields.io/badge/Status-Open-555555?style=flat-square) |
| [QUAL-005](#qual-005) | ![Priority: Low](https://img.shields.io/badge/Priority-Low-0E8A16?style=flat-square) | ![Type: Quality](https://img.shields.io/badge/Type-Quality-5319E7?style=flat-square) | Missing `.env.example`; README references nonexistent file | ![Effort: Small](https://img.shields.io/badge/Effort-Small-C2E0C6?style=flat-square) | ![Status: Open](https://img.shields.io/badge/Status-Open-555555?style=flat-square) |
| [QUAL-006](#qual-006) | ![Priority: Low](https://img.shields.io/badge/Priority-Low-0E8A16?style=flat-square) | ![Type: Quality](https://img.shields.io/badge/Type-Quality-5319E7?style=flat-square) | ESLint warnings | ![Effort: Small](https://img.shields.io/badge/Effort-Small-C2E0C6?style=flat-square) | ![Status: Open](https://img.shields.io/badge/Status-Open-555555?style=flat-square) |
| [QUAL-007](#qual-007) | ![Priority: Low](https://img.shields.io/badge/Priority-Low-0E8A16?style=flat-square) | ![Type: Quality](https://img.shields.io/badge/Type-Quality-5319E7?style=flat-square) | Unchecked cast of localStorage data | ![Effort: Small](https://img.shields.io/badge/Effort-Small-C2E0C6?style=flat-square) | ![Status: Open](https://img.shields.io/badge/Status-Open-555555?style=flat-square) |
| [QUAL-008](#qual-008) | ![Priority: Low](https://img.shields.io/badge/Priority-Low-0E8A16?style=flat-square) | ![Type: Quality](https://img.shields.io/badge/Type-Quality-5319E7?style=flat-square) | Method-aliased route handlers | ![Effort: Small](https://img.shields.io/badge/Effort-Small-C2E0C6?style=flat-square) | ![Status: Open](https://img.shields.io/badge/Status-Open-555555?style=flat-square) |
| [PERF-007](#perf-007) | ![Priority: Low](https://img.shields.io/badge/Priority-Low-0E8A16?style=flat-square) | ![Type: Performance](https://img.shields.io/badge/Type-Performance-1D76DB?style=flat-square) | Multiple socket.io connections per tab | ![Effort: Medium](https://img.shields.io/badge/Effort-Medium-FEF2C0?style=flat-square) | ![Status: Open](https://img.shields.io/badge/Status-Open-555555?style=flat-square) |
| [PERF-008](#perf-008) | ![Priority: Low](https://img.shields.io/badge/Priority-Low-0E8A16?style=flat-square) | ![Type: Performance](https://img.shields.io/badge/Type-Performance-1D76DB?style=flat-square) | Unbounded SSE fan-out to upstream sockets | ![Effort: Medium](https://img.shields.io/badge/Effort-Medium-FEF2C0?style=flat-square) | ![Status: Open](https://img.shields.io/badge/Status-Open-555555?style=flat-square) |
| [QUAL-009](#qual-009) | ![Priority: Low](https://img.shields.io/badge/Priority-Low-0E8A16?style=flat-square) | ![Type: Quality](https://img.shields.io/badge/Type-Quality-5319E7?style=flat-square) | Oversized components | ![Effort: Medium](https://img.shields.io/badge/Effort-Medium-FEF2C0?style=flat-square) | ![Status: Open](https://img.shields.io/badge/Status-Open-555555?style=flat-square) |
| [QUAL-010](#qual-010) | ![Priority: Low](https://img.shields.io/badge/Priority-Low-0E8A16?style=flat-square) | ![Type: Quality](https://img.shields.io/badge/Type-Quality-5319E7?style=flat-square) | Accessibility not runtime-audited | ![Effort: Medium](https://img.shields.io/badge/Effort-Medium-FEF2C0?style=flat-square) | ![Status: Unverified](https://img.shields.io/badge/Status-Unverified-6A737D?style=flat-square) |

---

## 🔴 Critical findings

### SEC-001

**Vulnerable Next.js version (RCE / SSRF / cache poisoning)**

![Priority: Critical](https://img.shields.io/badge/Priority-Critical-B60205?style=flat-square) ![Type: Security](https://img.shields.io/badge/Type-Security-8B0000?style=flat-square) ![Effort: Small](https://img.shields.io/badge/Effort-Small-C2E0C6?style=flat-square) ![Status: Open](https://img.shields.io/badge/Status-Open-555555?style=flat-square)

| Field | Content |
|---|---|
| **ID** | `SEC-001` |
| **Priority** | 🔴 Critical |
| **Category** | Security |
| **Location** | `package.json:24` (`next: 16.3.2`), `package-lock.json` |
| **Description** | Next 16.0.0–16.3.7 is affected by GHSA-2xp9-vwfh-vxw4 (RCE in Image Optimization with AVIF), GHSA-vcvr-r3jv-pc5j (RCE in `next/og`), GHSA-cjq9-62q9-8jv4 (SSRF in Image Optimization), GHSA-4jqv-mc3x-m676 / GHSA-mcj8-r9mp-w47p (SSG/ISR cache poisoning), GHSA-p293-qw3h-jr36 (Windows RCE) and others. `sharp` and `source-map-js` also have high advisories. |
| **Impact** | `/_next/image` is enabled by default and `next/image` is used in 18 files, so RCE or SSRF on the web host is plausible. Likelihood: high once exploits are public. |
| **Fix** | Upgrade `next` and `eslint-config-next` to `16.4.0`, then run `npm audit fix` for `sharp` and `source-map-js`. |
| **Effort** | Small |
| **Status** | Open |

<sub>[↑ Back to index](#-findings-index)</sub>

---

## 🟠 High findings

### SEC-002

**~50 state-changing BFF routes have no CSRF / origin check**

![Priority: High](https://img.shields.io/badge/Priority-High-D93F0B?style=flat-square) ![Type: Security](https://img.shields.io/badge/Type-Security-8B0000?style=flat-square) ![Effort: Small](https://img.shields.io/badge/Effort-Small-C2E0C6?style=flat-square) ![Status: Open](https://img.shields.io/badge/Status-Open-555555?style=flat-square)

| Field | Content |
|---|---|
| **ID** | `SEC-002` |
| **Priority** | 🟠 High |
| **Category** | Security |
| **Location** | Every non-GET route without `rejectCrossSiteRequest`, e.g. `app/api/auth/login`, `auth/signup/*`, `auth/phone/*`, `auth/logout`, `auth/impersonation/exchange`, `deliveries/cart/**`, `deliveries/checkout` (POST), `address/**`, `profile` (PATCH), `profile/image`, `profile/notifications`, `profile/saved-cards/**`, `orders/[id]/cancel`, `orders/[id]/chat`, `orders/reviews`, `favourites`, `deliveries/search/**`, `support/*`, `contact`, `vendor-applications`, `maps/places`, `maps/place-details` |
| **Description** | Handlers call `request.json()` without checking `Content-Type` or `Origin`, so a cross-site `text/plain` form POST is accepted. The only protection is the cookie's SameSite=Lax. Login and signup also *set* a session on a cross-site top-level POST. |
| **Impact** | **Login CSRF:** the victim is signed into the attacker's account, and any cards or addresses they save go to the attacker. **Same-site / subdomain CSRF:** cancel orders, change addresses, delete cards. |
| **Fix** | Enforce the Origin / `Sec-Fetch-Site` check centrally for all non-GET `/api/*` requests in `proxy.ts`, so no route can be missed. |
| **Effort** | Small |
| **Status** | Open |

<sub>[↑ Back to index](#-findings-index)</sub>

### SEC-003

**No security headers (CSP, anti-framing, HSTS, nosniff)**

![Priority: High](https://img.shields.io/badge/Priority-High-D93F0B?style=flat-square) ![Type: Security](https://img.shields.io/badge/Type-Security-8B0000?style=flat-square) ![Effort: Small](https://img.shields.io/badge/Effort-Small-C2E0C6?style=flat-square) ![Status: Open](https://img.shields.io/badge/Status-Open-555555?style=flat-square)

| Field | Content |
|---|---|
| **ID** | `SEC-003` |
| **Priority** | 🟠 High |
| **Category** | Security |
| **Location** | `next.config.ts:6-16` |
| **Description** | Only `/auth/impersonate` sets any header. There is no `Content-Security-Policy`, `X-Frame-Options` / `frame-ancestors`, `Strict-Transport-Security`, `X-Content-Type-Options`, `Referrer-Policy` or `Permissions-Policy`, and `X-Powered-By` is still on. |
| **Impact** | Clickjacking of checkout, wallet top-up, password change and account deletion. MIME sniffing. No CSP to contain XSS, which matters more because of SEC-006. |
| **Fix** | Add the baseline headers to `headers()` for `/:path*` and set `poweredByHeader: false`. Roll out CSP in report-only mode first (Stripe, Google Maps / Identity, sockets). |
| **Effort** | Small |
| **Status** | Open |

<sub>[↑ Back to index](#-findings-index)</sub>

### SEC-004

**Path traversal into upstream API via unvalidated route params**

![Priority: High](https://img.shields.io/badge/Priority-High-D93F0B?style=flat-square) ![Type: Security](https://img.shields.io/badge/Type-Security-8B0000?style=flat-square) ![Effort: Small](https://img.shields.io/badge/Effort-Small-C2E0C6?style=flat-square) ![Status: Open](https://img.shields.io/badge/Status-Open-555555?style=flat-square)

| Field | Content |
|---|---|
| **ID** | `SEC-004` |
| **Priority** | 🟠 High |
| **Category** | Security |
| **Location** | `app/api/orders/[id]/route.ts:6`, `app/api/orders/[id]/cancel/route.ts:7`, `app/api/orders/reviews/[orderId]/route.ts:11` |
| **Description** | Path params are interpolated into the upstream URL with no validation or encoding. Next decodes `%2F`, so `/api/orders/..%2F..%2F<path>` resolves to an arbitrary upstream path. |
| **Impact** | The BFF becomes an open proxy to any upstream GET/PUT endpoint, carrying the user's bearer token (confused deputy). A top-level link can trigger this with Lax cookies. |
| **Fix** | Validate as UUID and use `encodeURIComponent`, matching `services/deliveries/cart.ts` and `services/api/support.ts`. |
| **Effort** | Small |
| **Status** | Open |

<sub>[↑ Back to index](#-findings-index)</sub>

### PERF-001

**Client IP not forwarded: all web users share one upstream rate-limit bucket**

![Priority: High](https://img.shields.io/badge/Priority-High-D93F0B?style=flat-square) ![Type: Performance](https://img.shields.io/badge/Type-Performance-1D76DB?style=flat-square) ![Effort: Small](https://img.shields.io/badge/Effort-Small-C2E0C6?style=flat-square) ![Status: Open](https://img.shields.io/badge/Status-Open-555555?style=flat-square)

| Field | Content |
|---|---|
| **ID** | `PERF-001` |
| **Priority** | 🟠 High |
| **Category** | Performance |
| **Location** | `services/api/server.ts` (`callApi`, `callPublicApi`, `getPublicApi`, multipart helpers), `app/api/support/attachments/route.ts` |
| **Description** | Upstream calls never carry the end user's IP. Verified in sipp-server: `otp-rate-limit.guard.ts` keys on `X-Forwarded-For`, then `X-Real-IP`, then `req.ip` (12 sends per 5 min). The global `ThrottlerModule` (80 req/min) keys on `req.ip`, and `trust proxy` is not set. |
| **Impact** | Every web customer maps to the BFF host's IP. Twelve OTP sends site-wide lock signup, phone login, forgot-password and password change for **all** web users. Moderate traffic hits global 429s. Likely already happening under load. |
| **Fix** | Forward the client IP (from the platform-set `x-forwarded-for` / `x-real-ip`) as `X-Forwarded-For` on upstream calls. Backend: trust the BFF as a proxy so the global throttler uses it too. |
| **Effort** | Small |
| **Status** | Open |

<sub>[↑ Back to index](#-findings-index)</sub>

### SEC-005

**Account enumeration endpoint with no rate limit**

![Priority: High](https://img.shields.io/badge/Priority-High-D93F0B?style=flat-square) ![Type: Security](https://img.shields.io/badge/Type-Security-8B0000?style=flat-square) ![Effort: Small–Medium](https://img.shields.io/badge/Effort-Small%E2%80%93Medium-C2E0C6?style=flat-square) ![Status: Open](https://img.shields.io/badge/Status-Open-555555?style=flat-square)

| Field | Content |
|---|---|
| **ID** | `SEC-005` |
| **Priority** | 🟠 High |
| **Category** | Security |
| **Location** | `app/api/auth/exists/route.ts` |
| **Description** | An unauthenticated endpoint answers "is this email registered?" by attempting a real login with a probe password and reading the status code. |
| **Impact** | Bulk harvesting of customer emails. Each probe is a real failed login upstream, which adds log noise and becomes a lockout DoS if lockout is ever added. |
| **Fix** | Short term: the origin check (SEC-002) plus IP forwarding (PERF-001). Long term: a rate-limited upstream lookup, or remove the email-first UX. |
| **Effort** | Small–Medium |
| **Status** | Open |

<sub>[↑ Back to index](#-findings-index)</sub>

### SEC-006

**Raw access token (JWT) returned to browser JavaScript**

![Priority: High](https://img.shields.io/badge/Priority-High-D93F0B?style=flat-square) ![Type: Security](https://img.shields.io/badge/Type-Security-8B0000?style=flat-square) ![Effort: Large](https://img.shields.io/badge/Effort-Large-F9D0C4?style=flat-square) ![Status: Open](https://img.shields.io/badge/Status-Open-555555?style=flat-square)

| Field | Content |
|---|---|
| **ID** | `SEC-006` |
| **Priority** | 🟠 High |
| **Category** | Security |
| **Location** | `app/api/deliveries/socket-session/route.ts:44-51`, `app/api/support/socket-session/route.ts`; consumers `CustomerOrderLiveConnection.tsx:43-50`, `useNotificationLiveSync.ts:25-35`, `useSupport.ts:34-41` |
| **Description** | These routes return `{ token }`, the upstream bearer JWT, so the browser can open socket.io directly. This breaks the AGENTS.md rule: "Never expose the upstream base URL or access token to a Client Component." |
| **Impact** | Any XSS, malicious extension or compromised third-party script can steal a 30-day token. The token keeps working after logout because nothing revokes it upstream. |
| **Fix** | Bridge sockets server-side over SSE (reuse `services/api/support-stream.ts`), or have the backend issue short-lived, socket-only tickets. |
| **Effort** | Large |
| **Status** | Open |

<sub>[↑ Back to index](#-findings-index)</sub>

---

## 🟡 Medium findings

### SEC-007

**Unvalidated request bodies spread into upstream calls**

![Priority: Medium](https://img.shields.io/badge/Priority-Medium-FBCA04?style=flat-square) ![Type: Security](https://img.shields.io/badge/Type-Security-8B0000?style=flat-square) ![Effort: Small](https://img.shields.io/badge/Effort-Small-C2E0C6?style=flat-square) ![Status: Open](https://img.shields.io/badge/Status-Open-555555?style=flat-square)

| Field | Content |
|---|---|
| **ID** | `SEC-007` |
| **Priority** | 🟡 Medium |
| **Category** | Security |
| **Location** | `app/api/auth/login/route.ts:7-11`, `app/api/auth/phone/verify/route.ts:7-11`, `app/api/favourites/route.ts:16-19` |
| **Description** | `{ ...body, app_type }` and `body: await request.json()` forward arbitrary fields. `request.json()` is not wrapped, so bad JSON throws. |
| **Impact** | Mass assignment of any upstream DTO field. Malformed input returns a 500. |
| **Fix** | Allow-list and validate fields (`email`, `password`, `phone`, `otp`, `storeId`); return 400 on invalid JSON. |
| **Effort** | Small |
| **Status** | Open |

<sub>[↑ Back to index](#-findings-index)</sub>

### SEC-008

**Raw query strings forwarded upstream**

![Priority: Medium](https://img.shields.io/badge/Priority-Medium-FBCA04?style=flat-square) ![Type: Security](https://img.shields.io/badge/Type-Security-8B0000?style=flat-square) ![Effort: Small](https://img.shields.io/badge/Effort-Small-C2E0C6?style=flat-square) ![Status: Open](https://img.shields.io/badge/Status-Open-555555?style=flat-square)

| Field | Content |
|---|---|
| **ID** | `SEC-008` |
| **Priority** | 🟡 Medium |
| **Category** | Security |
| **Location** | `app/api/orders/route.ts:6`, `app/api/orders/past/route.ts:6`, `app/api/favourites/route.ts:7` |
| **Description** | `request.nextUrl.searchParams` / `search` is passed to the upstream API verbatim. |
| **Impact** | Unbounded `limit` values cause heavy upstream queries, and arbitrary filters pass through. |
| **Fix** | Allow-list and clamp params, as `orders/scheduled` and `wallet/transactions` already do. |
| **Effort** | Small |
| **Status** | Open |

<sub>[↑ Back to index](#-findings-index)</sub>

### SEC-009

**Session cookie lifetime decoupled from JWT; no revocation on logout**

![Priority: Medium](https://img.shields.io/badge/Priority-Medium-FBCA04?style=flat-square) ![Type: Security](https://img.shields.io/badge/Type-Security-8B0000?style=flat-square) ![Effort: Small](https://img.shields.io/badge/Effort-Small-C2E0C6?style=flat-square) ![Status: Open](https://img.shields.io/badge/Status-Open-555555?style=flat-square)

| Field | Content |
|---|---|
| **ID** | `SEC-009` |
| **Priority** | 🟡 Medium |
| **Category** | Security |
| **Location** | `services/auth/session.ts:10-17`, `app/api/auth/logout/route.ts` |
| **Description** | Cookies use a fixed 30-day `maxAge` whatever the JWT `exp` is. There is no `__Host-` prefix. Logout clears cookies locally but never revokes the token upstream. |
| **Impact** | Stale sessions linger, and a leaked token (SEC-006) stays valid after the user logs out. |
| **Fix** | Derive `maxAge` from the JWT `exp` and use `__Host-` cookie names. Upstream revocation: **Unverified** that an endpoint exists; needs a backend endpoint. |
| **Effort** | Small |
| **Status** | Open |

<sub>[↑ Back to index](#-findings-index)</sub>

### SEC-010

**Support attachment upload trusts client-declared MIME type**

![Priority: Medium](https://img.shields.io/badge/Priority-Medium-FBCA04?style=flat-square) ![Type: Security](https://img.shields.io/badge/Type-Security-8B0000?style=flat-square) ![Effort: Small](https://img.shields.io/badge/Effort-Small-C2E0C6?style=flat-square) ![Status: Open](https://img.shields.io/badge/Status-Open-555555?style=flat-square)

| Field | Content |
|---|---|
| **ID** | `SEC-010` |
| **Priority** | 🟡 Medium |
| **Category** | Security |
| **Location** | `app/api/support/attachments/route.ts:10-15` |
| **Description** | `file.type` comes from the client and there is no magic-byte check (unlike `profile/image`). The token has a non-null `!` assertion, and upstream JSON parse errors become 503. |
| **Impact** | Mislabelled or polyglot files are stored and opened by support staff. |
| **Fix** | Reuse the `detectedImageType` signature check from `app/api/profile/image/route.ts` and add PDF (`%PDF`) and HEIC (`ftyp`). |
| **Effort** | Small |
| **Status** | Open |

<sub>[↑ Back to index](#-findings-index)</sub>

### SEC-011

**Order-chat attachment URLs not scheme-restricted**

![Priority: Medium](https://img.shields.io/badge/Priority-Medium-FBCA04?style=flat-square) ![Type: Security](https://img.shields.io/badge/Type-Security-8B0000?style=flat-square) ![Effort: Small](https://img.shields.io/badge/Effort-Small-C2E0C6?style=flat-square) ![Status: Open](https://img.shields.io/badge/Status-Open-555555?style=flat-square)

| Field | Content |
|---|---|
| **ID** | `SEC-011` |
| **Priority** | 🟡 Medium |
| **Category** | Security |
| **Location** | `app/api/orders/[id]/chat/route.ts:21-31` |
| **Description** | `attachmentUrls` are only length-checked. Support chat requires `https?://`; order chat accepts anything. |
| **Impact** | `javascript:` or `data:` URLs get stored and rendered in rider and customer clients. |
| **Fix** | Require `https://` URLs (ideally only the platform's upload host). |
| **Effort** | Small |
| **Status** | Open |

<sub>[↑ Back to index](#-findings-index)</sub>

### SEC-012

**SSE stream leaks internal socket origin and error text**

![Priority: Medium](https://img.shields.io/badge/Priority-Medium-FBCA04?style=flat-square) ![Type: Security](https://img.shields.io/badge/Type-Security-8B0000?style=flat-square) ![Effort: Small](https://img.shields.io/badge/Effort-Small-C2E0C6?style=flat-square) ![Status: Open](https://img.shields.io/badge/Status-Open-555555?style=flat-square)

| Field | Content |
|---|---|
| **ID** | `SEC-012` |
| **Priority** | 🟡 Medium |
| **Category** | Security |
| **Location** | `services/api/support-stream.ts:57-58` |
| **Description** | The `reconnecting` events include the upstream socket `origin`, `path` and raw `error.message`. |
| **Impact** | Internal infrastructure details are disclosed to every browser. |
| **Fix** | Emit only `{ reconnecting: true }` and log details on the server. |
| **Effort** | Small |
| **Status** | Open |

<sub>[↑ Back to index](#-findings-index)</sub>

### SEC-013

**Impersonation token delivered in URL query string**

![Priority: Medium](https://img.shields.io/badge/Priority-Medium-FBCA04?style=flat-square) ![Type: Security](https://img.shields.io/badge/Type-Security-8B0000?style=flat-square) ![Effort: Small](https://img.shields.io/badge/Effort-Small-C2E0C6?style=flat-square) ![Status: Open](https://img.shields.io/badge/Status-Open-555555?style=flat-square)

| Field | Content |
|---|---|
| **ID** | `SEC-013` |
| **Priority** | 🟡 Medium |
| **Category** | Security |
| **Location** | `modules/account/components/auth/ImpersonateExperience.tsx:18-20` (`/auth/impersonate?token=`) |
| **Description** | The admin-issued exchange token arrives as a query parameter. It is stripped from history, but the GET request is still logged by the CDN, proxy and server. |
| **Impact** | Anyone with log access can replay the token within its lifetime and act as the customer. |
| **Fix** | Deliver it in the URL fragment (`#token=`) or by POST, and make sure upstream tokens are single-use and expire within 60 s or less. |
| **Effort** | Small |
| **Status** | Open |

<sub>[↑ Back to index](#-findings-index)</sub>

### SEC-014

**Unauthenticated proxies to paid Google APIs**

![Priority: Medium](https://img.shields.io/badge/Priority-Medium-FBCA04?style=flat-square) ![Type: Security](https://img.shields.io/badge/Type-Security-8B0000?style=flat-square) ![Effort: Small](https://img.shields.io/badge/Effort-Small-C2E0C6?style=flat-square) ![Status: Open](https://img.shields.io/badge/Status-Open-555555?style=flat-square)

| Field | Content |
|---|---|
| **ID** | `SEC-014` |
| **Priority** | 🟡 Medium |
| **Category** | Security |
| **Location** | `app/api/maps/static`, `maps/places`, `maps/place-details`, `maps/reverse` |
| **Description** | Anyone can call these without a session or rate limit. Static Maps uses the server key directly. |
| **Impact** | Billing abuse by scripted callers. |
| **Fix** | Add the origin check (SEC-002) and IP forwarding (PERF-001), edge/CDN rate limiting and Google API quotas (infra decision). |
| **Effort** | Small |
| **Status** | Open |

<sub>[↑ Back to index](#-findings-index)</sub>

### PERF-002

**5-second order polling continues in background tabs**

![Priority: Medium](https://img.shields.io/badge/Priority-Medium-FBCA04?style=flat-square) ![Type: Performance](https://img.shields.io/badge/Type-Performance-1D76DB?style=flat-square) ![Effort: Small](https://img.shields.io/badge/Effort-Small-C2E0C6?style=flat-square) ![Status: Open](https://img.shields.io/badge/Status-Open-555555?style=flat-square)

| Field | Content |
|---|---|
| **ID** | `PERF-002` |
| **Priority** | 🟡 Medium |
| **Category** | Performance |
| **Location** | `modules/deliveries/components/OrdersExperience.tsx:51-52` |
| **Description** | `refetchInterval: 5_000` with `refetchIntervalInBackground: true`, even though `CustomerOrderLiveConnection` already pushes live updates. |
| **Impact** | About 720 upstream requests per hour per open tab, which makes PERF-001 throttling worse. |
| **Fix** | Set `refetchIntervalInBackground: false` and poll at 30 s or more while the socket is connected. |
| **Effort** | Small |
| **Status** | Open |

<sub>[↑ Back to index](#-findings-index)</sub>

### QUAL-001

**ESLint errors (React hooks rules)**

![Priority: Medium](https://img.shields.io/badge/Priority-Medium-FBCA04?style=flat-square) ![Type: Quality](https://img.shields.io/badge/Type-Quality-5319E7?style=flat-square) ![Effort: Small](https://img.shields.io/badge/Effort-Small-C2E0C6?style=flat-square) ![Status: Open](https://img.shields.io/badge/Status-Open-555555?style=flat-square)

| Field | Content |
|---|---|
| **ID** | `QUAL-001` |
| **Priority** | 🟡 Medium |
| **Category** | Quality |
| **Location** | `providers/AppProviders.tsx:30`, `StoreFavouriteButton.tsx:25`, `SocialAuthButtons.tsx:60`, `OrderRiderChatDialog.tsx:24` |
| **Description** | 4 errors: `react-hooks/set-state-in-effect` (x2) and `react-hooks/refs` (x2). |
| **Impact** | Cascading re-renders, refs read during render, and a lint gate that cannot pass in CI. |
| **Fix** | Fix each in place (derive state, or move ref reads into effects and handlers). |
| **Effort** | Small |
| **Status** | Open |

<sub>[↑ Back to index](#-findings-index)</sub>

### QUAL-002

**Arabic locale shipped without RTL direction**

![Priority: Medium](https://img.shields.io/badge/Priority-Medium-FBCA04?style=flat-square) ![Type: Quality](https://img.shields.io/badge/Type-Quality-5319E7?style=flat-square) ![Effort: Small](https://img.shields.io/badge/Effort-Small-C2E0C6?style=flat-square) ![Status: Open](https://img.shields.io/badge/Status-Open-555555?style=flat-square)

| Field | Content |
|---|---|
| **ID** | `QUAL-002` |
| **Priority** | 🟡 Medium |
| **Category** | Quality |
| **Location** | `app/layout.tsx:47-52`, `i18n/config.ts` |
| **Description** | `ar` is a supported locale, but `<html>` has only `lang` and no `dir="rtl"`. |
| **Impact** | Arabic users get a mirrored, broken layout (accessibility and i18n). |
| **Fix** | Set `dir` from the locale and check that CSS uses logical properties. |
| **Effort** | Small |
| **Status** | Open |

<sub>[↑ Back to index](#-findings-index)</sub>

### PERF-003

**Store and product images bypass optimization**

![Priority: Medium](https://img.shields.io/badge/Priority-Medium-FBCA04?style=flat-square) ![Type: Performance](https://img.shields.io/badge/Type-Performance-1D76DB?style=flat-square) ![Effort: Medium](https://img.shields.io/badge/Effort-Medium-FEF2C0?style=flat-square) ![Status: Open](https://img.shields.io/badge/Status-Open-555555?style=flat-square)

| Field | Content |
|---|---|
| **ID** | `PERF-003` |
| **Priority** | 🟡 Medium |
| **Category** | Performance |
| **Location** | `modules/deliveries/components/discovery/DeliveryImage.tsx:48-60`, `modules/account/components/location/MapThumb.tsx:39` |
| **Description** | `next/image` is used with `unoptimized` and a passthrough loader, so original full-size images are downloaded everywhere. |
| **Impact** | Heavy discovery and store pages, and poor LCP on mobile networks. |
| **Fix** | Configure `images.remotePatterns` for the upload CDN and remove `unoptimized` (after SEC-001), or serve resized variants from the CDN. |
| **Effort** | Medium |
| **Status** | Open |

<sub>[↑ Back to index](#-findings-index)</sub>

### PERF-004

**Public data fetched with `no-store` on every request**

![Priority: Medium](https://img.shields.io/badge/Priority-Medium-FBCA04?style=flat-square) ![Type: Performance](https://img.shields.io/badge/Type-Performance-1D76DB?style=flat-square) ![Effort: Medium](https://img.shields.io/badge/Effort-Medium-FEF2C0?style=flat-square) ![Status: Open](https://img.shields.io/badge/Status-Open-555555?style=flat-square)

| Field | Content |
|---|---|
| **ID** | `PERF-004` |
| **Priority** | 🟡 Medium |
| **Category** | Performance |
| **Location** | `services/api/server.ts` (`cache: "no-store"` everywhere), `services/deliveries/discovery.ts`, `restaurant.ts`, `search.ts`, `app/api/languages`, `app/api/currency` |
| **Description** | Non-personal data (shop types, banners, languages, currency, public store pages) is never cached. |
| **Impact** | Redundant upstream load (which makes PERF-001 worse) and slower TTFB. |
| **Fix** | Add short `revalidate` or `s-maxage` with `stale-while-revalidate` for public, location-scoped endpoints. |
| **Effort** | Medium |
| **Status** | Open |

<sub>[↑ Back to index](#-findings-index)</sub>

### QUAL-003

**No error / not-found boundaries**

![Priority: Medium](https://img.shields.io/badge/Priority-Medium-FBCA04?style=flat-square) ![Type: Quality](https://img.shields.io/badge/Type-Quality-5319E7?style=flat-square) ![Effort: Medium](https://img.shields.io/badge/Effort-Medium-FEF2C0?style=flat-square) ![Status: Open](https://img.shields.io/badge/Status-Open-555555?style=flat-square)

| Field | Content |
|---|---|
| **ID** | `QUAL-003` |
| **Priority** | 🟡 Medium |
| **Category** | Quality |
| **Location** | `app/` (only `app/discovery/loading.tsx` exists) |
| **Description** | There is no `error.tsx`, `not-found.tsx` or `global-error.tsx` anywhere. |
| **Impact** | Unhandled render errors show a blank page, and bad store links have no 404 page. |
| **Fix** | Add a root `global-error.tsx`, `not-found.tsx`, and segment `error.tsx` for checkout, orders and restaurants. |
| **Effort** | Medium |
| **Status** | Open |

<sub>[↑ Back to index](#-findings-index)</sub>

### QUAL-004

**No automated tests or CI pipeline**

![Priority: Medium](https://img.shields.io/badge/Priority-Medium-FBCA04?style=flat-square) ![Type: Quality](https://img.shields.io/badge/Type-Quality-5319E7?style=flat-square) ![Effort: Medium](https://img.shields.io/badge/Effort-Medium-FEF2C0?style=flat-square) ![Status: Open](https://img.shields.io/badge/Status-Open-555555?style=flat-square)

| Field | Content |
|---|---|
| **ID** | `QUAL-004` |
| **Priority** | 🟡 Medium |
| **Category** | Quality |
| **Location** | Repository-wide |
| **Description** | There is no test runner and no tests for the auth, session, password-reset or BFF routes. No CI config exists. |
| **Impact** | Security regressions (like the ones in this report) go unnoticed. |
| **Fix** | Adopt Vitest for route and helper tests and Playwright for key flows, plus a CI job running lint, tsc, the i18n audit, build and `npm audit` (new dev dependencies; needs approval). |
| **Effort** | Medium |
| **Status** | Open |

<sub>[↑ Back to index](#-findings-index)</sub>

### PERF-005

**Client-only rendering for SEO-critical pages**

![Priority: Medium](https://img.shields.io/badge/Priority-Medium-FBCA04?style=flat-square) ![Type: Performance](https://img.shields.io/badge/Type-Performance-1D76DB?style=flat-square) ![Effort: Large](https://img.shields.io/badge/Effort-Large-F9D0C4?style=flat-square) ![Status: Open](https://img.shields.io/badge/Status-Open-555555?style=flat-square)

| Field | Content |
|---|---|
| **ID** | `PERF-005` |
| **Priority** | 🟡 Medium |
| **Category** | Performance |
| **Location** | `app/restaurants/[id]/page.tsx`, `app/discovery/page.tsx`, most `app/**/page.tsx` |
| **Description** | Pages render a client component that fetches all data after hydration. There is no server prefetch and no per-page `generateMetadata`. |
| **Impact** | A request waterfall worsens LCP, and store pages have generic titles with weak SEO and social previews. |
| **Fix** | Prefetch on the server with TanStack Query `HydrationBoundary`, and add `generateMetadata` for store and discovery pages. |
| **Effort** | Large |
| **Status** | Open |

<sub>[↑ Back to index](#-findings-index)</sub>

---

## 🟢 Low findings

### SEC-015

**Localhost fallbacks for required env vars**

![Priority: Low](https://img.shields.io/badge/Priority-Low-0E8A16?style=flat-square) ![Type: Security](https://img.shields.io/badge/Type-Security-8B0000?style=flat-square) ![Effort: Small](https://img.shields.io/badge/Effort-Small-C2E0C6?style=flat-square) ![Status: Open](https://img.shields.io/badge/Status-Open-555555?style=flat-square)

| Field | Content |
|---|---|
| **ID** | `SEC-015` |
| **Priority** | 🟢 Low |
| **Category** | Security |
| **Location** | `services/api/server.ts:9`, `app/api/auth/session/route.ts:31`, `app/api/support/attachments/route.ts:13` |
| **Description** | `API_BASE_URL` and `ADMIN_WEB_URL` silently fall back to `http://localhost:3000/...`. |
| **Impact** | A production misconfiguration fails silently instead of at startup. |
| **Fix** | Throw when these are unset and `NODE_ENV === "production"`. |
| **Effort** | Small |
| **Status** | Open |

<sub>[↑ Back to index](#-findings-index)</sub>

### SEC-016

**Unvalidated redirect to upstream checkout URL**

![Priority: Low](https://img.shields.io/badge/Priority-Low-0E8A16?style=flat-square) ![Type: Security](https://img.shields.io/badge/Type-Security-8B0000?style=flat-square) ![Effort: Small](https://img.shields.io/badge/Effort-Small-C2E0C6?style=flat-square) ![Status: Open](https://img.shields.io/badge/Status-Open-555555?style=flat-square)

| Field | Content |
|---|---|
| **ID** | `SEC-016` |
| **Priority** | 🟢 Low |
| **Category** | Security |
| **Location** | `modules/deliveries/components/checkout/CheckoutPage.tsx:200-202` |
| **Description** | `window.location.assign(response.checkoutUrl)` runs without checking the host. |
| **Impact** | An open redirect if the upstream response is ever tampered with or misconfigured. |
| **Fix** | Allow only `https://checkout.stripe.com`. |
| **Effort** | Small |
| **Status** | Open |

<sub>[↑ Back to index](#-findings-index)</sub>

### SEC-017

**Contact form lacks format and length validation**

![Priority: Low](https://img.shields.io/badge/Priority-Low-0E8A16?style=flat-square) ![Type: Security](https://img.shields.io/badge/Type-Security-8B0000?style=flat-square) ![Effort: Small](https://img.shields.io/badge/Effort-Small-C2E0C6?style=flat-square) ![Status: Open](https://img.shields.io/badge/Status-Open-555555?style=flat-square)

| Field | Content |
|---|---|
| **ID** | `SEC-017` |
| **Priority** | 🟢 Low |
| **Category** | Security |
| **Location** | `app/api/contact/route.ts` |
| **Description** | Only a non-empty check. There is no email format check and no length caps. |
| **Impact** | Spam relay and oversized payloads reach the mailer. |
| **Fix** | Validate the email (reuse `isValidEmail`) and cap name/subject/message lengths. |
| **Effort** | Small |
| **Status** | Open |

<sub>[↑ Back to index](#-findings-index)</sub>

### SEC-018

**Identity read from unsigned user cookie (informational)**

![Priority: Low](https://img.shields.io/badge/Priority-Low-0E8A16?style=flat-square) ![Type: Security](https://img.shields.io/badge/Type-Security-8B0000?style=flat-square) ![Effort: Small](https://img.shields.io/badge/Effort-Small-C2E0C6?style=flat-square) ![Status: Open](https://img.shields.io/badge/Status-Open-555555?style=flat-square)

| Field | Content |
|---|---|
| **ID** | `SEC-018` |
| **Priority** | 🟢 Low |
| **Category** | Security |
| **Location** | `services/api/request-security.ts:29`, `app/api/notifications/[period]/route.ts:18-24` |
| **Description** | The email and user id come from the base64 `shaaneiol_user` cookie, which is not signed. **Verified:** upstream ignores the path `userId` and scopes by `req.userId` (`users-notifications.controller.ts:46-63`, `settings.controller.ts`). |
| **Impact** | Low: users can only tamper with their own cookie, and upstream re-scopes. |
| **Fix** | Optional: HMAC-sign the user cookie like the password-reset grant. |
| **Effort** | Small |
| **Status** | Open |

<sub>[↑ Back to index](#-findings-index)</sub>

### SEC-019

**Password-reset grant is replayable within its TTL**

![Priority: Low](https://img.shields.io/badge/Priority-Low-0E8A16?style=flat-square) ![Type: Security](https://img.shields.io/badge/Type-Security-8B0000?style=flat-square) ![Effort: Small](https://img.shields.io/badge/Effort-Small-C2E0C6?style=flat-square) ![Status: Unverified](https://img.shields.io/badge/Status-Unverified-6A737D?style=flat-square)

| Field | Content |
|---|---|
| **ID** | `SEC-019` |
| **Priority** | 🟢 Low |
| **Category** | Security |
| **Location** | `services/auth/password-reset.ts` |
| **Description** | The stateless HMAC cookie stays valid for 10 minutes. Clearing it after use is client-side only. |
| **Impact** | A captured cookie could reset the password again. **Unverified** whether upstream `/otp/reset-password` enforces one-time use. |
| **Fix** | Add a nonce and enforce single use upstream. |
| **Effort** | Small |
| **Status** | Unverified |

<sub>[↑ Back to index](#-findings-index)</sub>

### SEC-020

**Public Google Maps key restrictions not verifiable**

![Priority: Low](https://img.shields.io/badge/Priority-Low-0E8A16?style=flat-square) ![Type: Security](https://img.shields.io/badge/Type-Security-8B0000?style=flat-square) ![Effort: Small](https://img.shields.io/badge/Effort-Small-C2E0C6?style=flat-square) ![Status: Unverified](https://img.shields.io/badge/Status-Unverified-6A737D?style=flat-square)

| Field | Content |
|---|---|
| **ID** | `SEC-020` |
| **Priority** | 🟢 Low |
| **Category** | Security |
| **Location** | `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` (client bundle; `.env` is git-ignored and was never committed, verified) |
| **Description** | The browser key is public by design. HTTP-referrer and API restrictions cannot be confirmed from code. |
| **Impact** | Quota and billing abuse if the key is unrestricted. |
| **Fix** | Confirm referrer and API restrictions and set quotas in Google Cloud Console (manual). |
| **Effort** | Small |
| **Status** | Unverified |

<sub>[↑ Back to index](#-findings-index)</sub>

### SEC-021

**Visitor IP sent to third-party geo service**

![Priority: Low](https://img.shields.io/badge/Priority-Low-0E8A16?style=flat-square) ![Type: Security](https://img.shields.io/badge/Type-Security-8B0000?style=flat-square) ![Effort: Small](https://img.shields.io/badge/Effort-Small-C2E0C6?style=flat-square) ![Status: Open](https://img.shields.io/badge/Status-Open-555555?style=flat-square)

| Field | Content |
|---|---|
| **ID** | `SEC-021` |
| **Priority** | 🟢 Low |
| **Category** | Security |
| **Location** | `app/api/auth/region/route.ts` |
| **Description** | Falls back to unauthenticated `ipinfo.io` lookups with the visitor's IP. |
| **Impact** | Privacy and compliance exposure (undisclosed processor) and third-party rate limits. |
| **Fix** | Prefer platform geo headers (`x-vercel-ip-country`, `cf-ipcountry`) and document the processor. |
| **Effort** | Small |
| **Status** | Open |

<sub>[↑ Back to index](#-findings-index)</sub>

### PERF-006

**Raw `<img>` without dimensions or lazy loading**

![Priority: Low](https://img.shields.io/badge/Priority-Low-0E8A16?style=flat-square) ![Type: Performance](https://img.shields.io/badge/Type-Performance-1D76DB?style=flat-square) ![Effort: Small](https://img.shields.io/badge/Effort-Small-C2E0C6?style=flat-square) ![Status: Open](https://img.shields.io/badge/Status-Open-555555?style=flat-square)

| Field | Content |
|---|---|
| **ID** | `PERF-006` |
| **Priority** | 🟢 Low |
| **Category** | Performance |
| **Location** | `FavouritesExperience.tsx:20`, `ContactMapBanner.tsx:23`, `OrderRiderChatDialog.tsx:121,130` |
| **Description** | Flagged by `@next/next/no-img-element`. |
| **Impact** | Layout shift (CLS) and extra bytes. |
| **Fix** | Use `next/image`, or set `width`/`height` and `loading="lazy"`. |
| **Effort** | Small |
| **Status** | Open |

<sub>[↑ Back to index](#-findings-index)</sub>

### QUAL-005

**Missing `.env.example`; README references nonexistent file**

![Priority: Low](https://img.shields.io/badge/Priority-Low-0E8A16?style=flat-square) ![Type: Quality](https://img.shields.io/badge/Type-Quality-5319E7?style=flat-square) ![Effort: Small](https://img.shields.io/badge/Effort-Small-C2E0C6?style=flat-square) ![Status: Open](https://img.shields.io/badge/Status-Open-555555?style=flat-square)

| Field | Content |
|---|---|
| **ID** | `QUAL-005` |
| **Priority** | 🟢 Low |
| **Category** | Quality |
| **Location** | `README.md:146` |
| **Description** | `cp sample.env .env.local`, but `sample.env` does not exist. Required variables are undocumented (`API_BASE_URL`, `ADMIN_WEB_URL`, `SHAANIEOL_PASSWORD_RESET_SECRET`, `GOOGLE_MAPS_API_KEY`, `SHAANIEOL_SOCKET_URL/PATH`, `NEXT_PUBLIC_*`). |
| **Impact** | Misconfigured deploys (see SEC-015). |
| **Fix** | Add `.env.example` with placeholder values. |
| **Effort** | Small |
| **Status** | Open |

<sub>[↑ Back to index](#-findings-index)</sub>

### QUAL-006

**ESLint warnings**

![Priority: Low](https://img.shields.io/badge/Priority-Low-0E8A16?style=flat-square) ![Type: Quality](https://img.shields.io/badge/Type-Quality-5319E7?style=flat-square) ![Effort: Small](https://img.shields.io/badge/Effort-Small-C2E0C6?style=flat-square) ![Status: Open](https://img.shields.io/badge/Status-Open-555555?style=flat-square)

| Field | Content |
|---|---|
| **ID** | `QUAL-006` |
| **Priority** | 🟢 Low |
| **Category** | Quality |
| **Location** | 14 warnings: unused imports (`app/page.tsx:10`, `Header.tsx:8`), `exhaustive-deps` (x8), `no-img-element` (x4) |
| **Description** | Lint warnings left unaddressed. |
| **Impact** | Possible stale-closure bugs (WalletTopUpModal, OrderRouteMap, AuthExperience). |
| **Fix** | Clean up the warnings. |
| **Effort** | Small |
| **Status** | Open |

<sub>[↑ Back to index](#-findings-index)</sub>

### QUAL-007

**Unchecked cast of localStorage data**

![Priority: Low](https://img.shields.io/badge/Priority-Low-0E8A16?style=flat-square) ![Type: Quality](https://img.shields.io/badge/Type-Quality-5319E7?style=flat-square) ![Effort: Small](https://img.shields.io/badge/Effort-Small-C2E0C6?style=flat-square) ![Status: Open](https://img.shields.io/badge/Status-Open-555555?style=flat-square)

| Field | Content |
|---|---|
| **ID** | `QUAL-007` |
| **Priority** | 🟢 Low |
| **Category** | Quality |
| **Location** | `modules/account/api/location.ts:66-73` |
| **Description** | `JSON.parse(raw) as ChosenPlace` has no shape validation. |
| **Impact** | Corrupt or old storage crashes pages that depend on location. |
| **Fix** | Validate the shape (lat/lng numbers, address string) before use. |
| **Effort** | Small |
| **Status** | Open |

<sub>[↑ Back to index](#-findings-index)</sub>

### QUAL-008

**Method-aliased route handlers**

![Priority: Low](https://img.shields.io/badge/Priority-Low-0E8A16?style=flat-square) ![Type: Quality](https://img.shields.io/badge/Type-Quality-5319E7?style=flat-square) ![Effort: Small](https://img.shields.io/badge/Effort-Small-C2E0C6?style=flat-square) ![Status: Open](https://img.shields.io/badge/Status-Open-555555?style=flat-square)

| Field | Content |
|---|---|
| **ID** | `QUAL-008` |
| **Priority** | 🟢 Low |
| **Category** | Quality |
| **Location** | `app/api/support/chats/[id]/route.ts:6` (`export const POST = GET`), `app/api/support/tickets/route.ts` |
| **Description** | One function serves several HTTP methods by branching on `request.method`. |
| **Impact** | Easy to miss per-method guards when editing. |
| **Fix** | Use explicit per-method exports. |
| **Effort** | Small |
| **Status** | Open |

<sub>[↑ Back to index](#-findings-index)</sub>

### PERF-007

**Multiple socket.io connections per tab**

![Priority: Low](https://img.shields.io/badge/Priority-Low-0E8A16?style=flat-square) ![Type: Performance](https://img.shields.io/badge/Type-Performance-1D76DB?style=flat-square) ![Effort: Medium](https://img.shields.io/badge/Effort-Medium-FEF2C0?style=flat-square) ![Status: Open](https://img.shields.io/badge/Status-Open-555555?style=flat-square)

| Field | Content |
|---|---|
| **ID** | `PERF-007` |
| **Priority** | 🟢 Low |
| **Category** | Performance |
| **Location** | `useNotificationLiveSync.ts`, `CustomerOrderLiveConnection.tsx`, `useSupport.ts` |
| **Description** | Each feature opens its own connection to the same namespace. |
| **Impact** | Up to 3 sockets per tab, adding upstream connection load. |
| **Fix** | Share one connection through a provider (fold into the SEC-006 redesign). |
| **Effort** | Medium |
| **Status** | Open |

<sub>[↑ Back to index](#-findings-index)</sub>

### PERF-008

**Unbounded SSE fan-out to upstream sockets**

![Priority: Low](https://img.shields.io/badge/Priority-Low-0E8A16?style=flat-square) ![Type: Performance](https://img.shields.io/badge/Type-Performance-1D76DB?style=flat-square) ![Effort: Medium](https://img.shields.io/badge/Effort-Medium-FEF2C0?style=flat-square) ![Status: Open](https://img.shields.io/badge/Status-Open-555555?style=flat-square)

| Field | Content |
|---|---|
| **ID** | `PERF-008` |
| **Priority** | 🟢 Low |
| **Category** | Performance |
| **Location** | `services/api/support-stream.ts` |
| **Description** | Each SSE client opens a dedicated upstream socket for up to 4 minutes, with no per-session cap. |
| **Impact** | Connection fan-out on the BFF when many tabs are open. |
| **Fix** | Cap concurrent streams per session. |
| **Effort** | Medium |
| **Status** | Open |

<sub>[↑ Back to index](#-findings-index)</sub>

### QUAL-009

**Oversized components**

![Priority: Low](https://img.shields.io/badge/Priority-Low-0E8A16?style=flat-square) ![Type: Quality](https://img.shields.io/badge/Type-Quality-5319E7?style=flat-square) ![Effort: Medium](https://img.shields.io/badge/Effort-Medium-FEF2C0?style=flat-square) ![Status: Open](https://img.shields.io/badge/Status-Open-555555?style=flat-square)

| Field | Content |
|---|---|
| **ID** | `QUAL-009` |
| **Priority** | 🟢 Low |
| **Category** | Quality |
| **Location** | `AuthExperience.tsx` (881 lines), `CheckoutPage.tsx` (551), `WalletDashboard.tsx` (518), `ProductConfigurator.tsx` (516), `LocationModal.tsx` (460) |
| **Description** | Far beyond the ~200-line review signal in AGENTS.md. |
| **Impact** | Hard to review and test, and they cause wide re-renders. |
| **Fix** | Split by behaviour (steps, panels, hooks). |
| **Effort** | Medium |
| **Status** | Open |

<sub>[↑ Back to index](#-findings-index)</sub>

### QUAL-010

**Accessibility not runtime-audited**

![Priority: Low](https://img.shields.io/badge/Priority-Low-0E8A16?style=flat-square) ![Type: Quality](https://img.shields.io/badge/Type-Quality-5319E7?style=flat-square) ![Effort: Medium](https://img.shields.io/badge/Effort-Medium-FEF2C0?style=flat-square) ![Status: Unverified](https://img.shields.io/badge/Status-Unverified-6A737D?style=flat-square)

| Field | Content |
|---|---|
| **ID** | `QUAL-010` |
| **Priority** | 🟢 Low |
| **Category** | Quality |
| **Location** | UI-wide |
| **Description** | There are 187 `aria-label`s, but no axe, keyboard or screen-reader pass was run as part of this static audit. |
| **Impact** | Unknown. **Unverified.** |
| **Fix** | Run axe or Lighthouse on login, discovery, store, checkout and profile. |
| **Effort** | Medium |
| **Status** | Unverified |

<sub>[↑ Back to index](#-findings-index)</sub>

---

## 🧭 Manual actions and decisions

| Item | Related | Owner |
|---|---|---|
| Approve the Next.js `16.4.0` upgrade and `npm audit fix` | SEC-001 | Web lead |
| Choose a socket design: an SSE bridge in the web app, or short-lived socket tickets from the backend | SEC-006, PERF-007 | Web + Backend |
| Backend: trust the BFF as a proxy so the global throttler uses the forwarded client IP | PERF-001 | Backend / Infra |
| Check Google Maps key restrictions; set Places / Static Maps quotas and an edge rate limit | SEC-014, SEC-020 | Infra |
| Confirm upstream one-time use for password-reset and impersonation tokens | SEC-013, SEC-019 | Backend |
| Approve test tooling (Vitest, Playwright) and a CI pipeline | QUAL-004 | Web lead |

> 🔐 **Secrets:** none were found in tracked files or git history. `.env` exists locally only and contains public client keys plus server URLs. No rotation is required based on this audit.

## 🚀 Recommended follow-ups

- **CI security gate:** lint, `tsc`, i18n audit, build and `npm audit --audit-level=high` on every PR. Enable Dependabot or Renovate.
- **Monitoring:** error tracking (e.g. Sentry) for route handlers and the client, plus upstream latency and 429 rate dashboards (this would surface PERF-001).
- **Dependency policy:** monthly minor updates, with security patches applied within 7 days of an advisory.
- **CSP rollout:** run in `Content-Security-Policy-Report-Only` mode for a sprint, then enforce.
- **Re-audit** after the Critical and High fixes land, including a runtime accessibility pass (QUAL-010) and a Lighthouse baseline.

---

<div align="center"><sub>Generated 2026-10-09 · Report only, no code changes applied · Live doc: <a href="https://claude.ai/code/artifact/9a30d474-5327-4dec-8cd7-4f0a8fee606a">https://claude.ai/code/artifact/9a30d474-5327-4dec-8cd7-4f0a8fee606a</a></sub></div>
