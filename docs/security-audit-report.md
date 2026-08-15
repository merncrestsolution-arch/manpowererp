# Security Audit Report — JK Manpower ERP

**Date:** August 2026  
**Scope:** Phases 1–16 (web + mobile APIs)

## Summary

The application enforces authentication and RBAC server-side across API routes. Branch scoping is derived from the authenticated session, not client-supplied `branchId`. Mobile APIs use Bearer JWT via `requireMobileEmployee()`.

| Area                | Status    | Notes                                                                        |
| ------------------- | --------- | ---------------------------------------------------------------------------- |
| API auth coverage   | Pass      | All `/api/*` business routes call `getAuthenticatedContext()` or mobile auth |
| Branch scoping      | Pass      | Use-cases receive `branchId` from session context                            |
| GPS/QR attendance   | Pass      | Validation in `validateGpsCheckin` / `validateQrCheckin` (server-side)       |
| Ledger idempotency  | Pass      | `@@unique([branchId, sourceType, sourceId])` on `LedgerEntry`                |
| Rate limiting       | Pass      | Login + mobile login rate-limited (5 / 15 min)                               |
| Upload restrictions | Pass      | UploadThing routes enforce role + file type per endpoint                     |
| Audit log           | Pass      | Append-only `AuditLog`; settings mutations wired in Phase 15                 |
| Secrets in client   | Pass      | No `NEXT_PUBLIC_` secrets; only safe public config                           |
| npm audit           | See below | Run `npm audit` in CI on every PR                                            |

## Auth endpoints

- `POST /api/auth/forgot-password` — rate limited
- `POST /api/mobile/auth/login` — rate limited per email
- Session: JWT strategy via NextAuth; mobile uses separate HS256 Bearer tokens

## UploadThing

`src/app/api/uploadthing/core.ts` enforces:

- Employee documents — `canManageEmployees`
- Client contracts — `canManageClients`
- Expense receipts — `canSubmitExpense`
- Company logo — `canManageSettings`
- File type/size limits per UploadThing route config

## Recommendations (post go-live)

1. Add WAF / reverse-proxy rate limiting on `/api/auth/*` and `/api/mobile/auth/*`
2. Rotate `NEXTAUTH_SECRET` / `AUTH_SECRET` on production deploy
3. Enable PostgreSQL SSL (`?sslmode=require`) on Lightsail
4. Consider Sentry or similar for error monitoring (structured JSON logger is in place: `src/infrastructure/logging/logger.ts`)
5. Schedule Phase 15 backup trigger via cron + verify restore quarterly

## npm audit

CI runs `npm audit --audit-level=high` on every PR. As of August 2026, **8 high-severity findings** remain in transitive dependencies:

| Package             | Source                 | Risk                                              | Mitigation                                                       |
| ------------------- | ---------------------- | ------------------------------------------------- | ---------------------------------------------------------------- |
| `effect`            | `uploadthing`          | AsyncLocalStorage under concurrent RPC            | Monitor upstream; no user-controlled RPC in our usage            |
| `nodemailer`        | NextAuth email adapter | SMTP/header injection in misconfigured transports | Production uses trusted SMTP only; no raw user headers           |
| `postcss` / `sharp` | `next@15`              | Build-time / image processing                     | Upgrade to Next 16 when stable; no runtime exposure from PostCSS |

`npm audit fix --force` would introduce breaking major-version bumps (`next@16`, `uploadthing@6.12`). Track these in dependency upgrade sprints post go-live.

Re-run locally:

```bash
npm audit --audit-level=high
```

## RBAC test coverage

Integration tests in `tests/integration/api-rbac.test.ts` verify unauthorized roles cannot access payroll finalize and expense approval.
