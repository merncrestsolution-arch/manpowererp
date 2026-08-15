# Database Optimization Notes

## Index audit (Final Phase)

Composite indexes were added in migration `20260810040000_production_indexes` for the most common branch-scoped list filters:

| Table        | Index                              | Query pattern          |
| ------------ | ---------------------------------- | ---------------------- |
| Employee     | `(branchId, status, deletedAt)`    | Employee list filters  |
| LeaveRequest | `(employeeId, status)`             | Employee leave history |
| Invoice      | `(branchId, status, deletedAt)`    | Invoice list           |
| Invoice      | `(branchId, dueDate)`              | Outstanding / aging    |
| Expense      | `(branchId, status, deletedAt)`    | Expense approvals      |
| Payslip      | `(branchId, status, deletedAt)`    | Payroll list           |
| Payslip      | `(employeeId, status)`             | Mobile payslip list    |
| LedgerEntry  | `(branchId, accountId, entryDate)` | Account ledger / P&L   |

Existing single-column indexes on foreign keys and filter columns were retained from Phases 1–16.

## N+1 review

List use-cases across Employees, Clients, Invoices, Payroll, and Reports use `include`/`select` with paginated `findMany` queries. No per-row Prisma calls were found in production list endpoints. Seed scripts (`seed-permissions`) intentionally upsert in a loop and run offline only.

## Manual EXPLAIN ANALYZE (run in production/staging)

Run against PostgreSQL after representative data is loaded:

```sql
EXPLAIN ANALYZE
SELECT * FROM "LedgerEntry"
WHERE "branchId" = $1 AND "accountId" = $2 AND "entryDate" BETWEEN $3 AND $4;

EXPLAIN ANALYZE
SELECT * FROM "Invoice"
WHERE "branchId" = $1 AND "status" IN ('SENT','OVERDUE','PARTIALLY_PAID')
  AND "deletedAt" IS NULL
ORDER BY "dueDate" ASC;

EXPLAIN ANALYZE
SELECT * FROM "Payslip"
WHERE "branchId" = $1 AND "status" = 'FINALIZED' AND "deletedAt" IS NULL;
```

Record `Seq Scan` vs `Index Scan` in your deployment notes. Expect index scans on the composite indexes above at scale.

## Table naming

Prisma models use PascalCase table names (default). No `@@map` overrides were required; naming is consistent across all 16 phases.
