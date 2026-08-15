# Testing Report

## Framework

- **Unit / integration:** Vitest (`vitest.config.ts`)
- **E2E smoke:** Playwright (`e2e/smoke.spec.ts`)

## Test suites

| Suite                   | File                                            | Coverage                                     |
| ----------------------- | ----------------------------------------------- | -------------------------------------------- |
| Journal balancing       | `tests/unit/journal-validation.test.ts`         | Debit/credit balance rules                   |
| Journal posting         | `tests/unit/post-journal-entry.test.ts`         | Unbalanced rejection + idempotent skip       |
| Invoice status          | `tests/unit/recalculate-invoice-status.test.ts` | PAID / OVERDUE / DRAFT                       |
| GPS validation          | `tests/unit/gps-validation.test.ts`             | Radius + haversine                           |
| QR tokens               | `tests/unit/qr-token.test.ts`                   | Sign/verify tamper resistance                |
| Sequence formatters     | `tests/unit/sequence.test.ts`                   | Document number formats                      |
| Sequence concurrency    | `tests/integration/sequence-concurrent.test.ts` | Unique values under parallel calls           |
| Run payroll             | `tests/unit/run-payroll.test.ts`                | Period not found, finalized period guard     |
| Finalize payslip        | `tests/unit/finalize-payslip.test.ts`           | Not found, non-draft rejection               |
| Record payment          | `tests/unit/record-payment.test.ts`             | Invalid date, overpayment, cancelled invoice |
| Change candidate status | `tests/unit/change-candidate-status.test.ts`    | Not found, placed candidate guard            |
| API RBAC                | `tests/integration/api-rbac.test.ts`            | Payroll finalize, expense approve            |

## Critical use-case coverage

| Use case                        | Coverage                                                                          |
| ------------------------------- | --------------------------------------------------------------------------------- |
| `post-journal-entry.ts`         | Unit tests (balance + idempotency) + schema unique constraint                     |
| `recalculate-invoice-status.ts` | Full unit tests                                                                   |
| `check-in.ts` / GPS             | Via `validateGpsCheckin` + `lib/geo` tests                                        |
| `check-in.ts` / QR              | Via `lib/qr-token` tests                                                          |
| `run-payroll.ts`                | Unit tests for guard rails; full payroll math via `payroll-calculations` in build |
| `finalize-payslip.ts`           | Unit tests + RBAC integration test                                                |
| `record-payment.ts`             | Unit tests for validation paths                                                   |
| `change-candidate-status.ts`    | Unit tests for guard rails                                                        |
| `place-candidate.ts`            | Covered by build + manual QA                                                      |

**Total:** 29 automated tests across 12 files (as of Final Phase sign-off).

## Running tests

```bash
npm run test          # Vitest unit + integration
npm run test:e2e      # Playwright (requires running app + `npx playwright install`)
```

## E2E smoke scope

Playwright smoke tests verify:

- Login page renders (`Welcome back` heading)
- Unauthenticated users are redirected from `/dashboard`

Full flows (employee → payroll → payslip, client → invoice → payment) require a seeded CI database and are documented for manual QA until Playwright auth fixtures are added.

## CI

GitHub Actions (`.github/workflows/ci.yml`) runs lint, build, tests, and `npm audit --audit-level=high` on every PR.
