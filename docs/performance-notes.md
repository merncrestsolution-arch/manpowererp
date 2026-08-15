# Performance Notes

## Measured build output (Final Phase)

| Metric                 | Value                                     |
| ---------------------- | ----------------------------------------- |
| Next.js routes         | 128                                       |
| Middleware             | 174 kB                                    |
| Shared First Load JS   | ~102 kB                                   |
| Largest page (reports) | ~433 kB (includes Recharts export bundle) |

Run `npm run build` after changes to refresh these numbers.

## React Query cache policy

Default `staleTime`: **60 seconds** (`src/components/providers/query-provider.tsx`).

| Data type                         | Recommendation                                              |
| --------------------------------- | ----------------------------------------------------------- |
| Dashboard KPIs                    | 60s default (acceptable staleness)                          |
| List tables (employees, invoices) | 60s + manual invalidation on mutation                       |
| Attendance today / check-in state | Override with `staleTime: 0` in attendance hooks when added |
| Settings / permissions matrix     | 30s or invalidate on PATCH                                  |

Attendance-specific hooks should pass `{ staleTime: 0 }` when real-time status is required.

## Server Components

Dashboard layout shells and list page wrappers remain Server Components where possible. Interactive tables, forms, and charts correctly use `"use client"`.

## Bundle hygiene

- `pdf-lib` is imported only from `src/infrastructure/pdf/*` and `src/lib/export/report-pdf-generator.ts` (server-side routes and API handlers).
- `recharts` is isolated to dashboard/report client components.
- No accidental `pdf-lib` imports in client components were found.

## Pagination

All list APIs (Employees, Clients, Invoices, Expenses, Payroll, Audit Logs) accept `page` / `pageSize` query params and use Prisma `skip`/`take`. No client-side full-table pagination was found.

## Performance budget targets

| Area               | Target            |
| ------------------ | ----------------- |
| LCP (dashboard)    | < 2.5s on 4G      |
| API list endpoints | < 500ms p95       |
| PDF generation     | < 3s per document |
| Mobile dashboard   | < 1s on Wi-Fi     |

Use Lighthouse against `/dashboard` and `/login` after deployment to capture real-user metrics.

## Loading states

`loading.tsx` added for dashboard, employees, payroll, finance, settings, and reports route groups.
