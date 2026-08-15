-- Composite indexes for production list/report query patterns

CREATE INDEX "Employee_branchId_status_deletedAt_idx" ON "Employee"("branchId", "status", "deletedAt");
CREATE INDEX "LeaveRequest_employeeId_status_idx" ON "LeaveRequest"("employeeId", "status");
CREATE INDEX "Invoice_branchId_status_deletedAt_idx" ON "Invoice"("branchId", "status", "deletedAt");
CREATE INDEX "Invoice_branchId_dueDate_idx" ON "Invoice"("branchId", "dueDate");
CREATE INDEX "Expense_branchId_status_deletedAt_idx" ON "Expense"("branchId", "status", "deletedAt");
CREATE INDEX "Payslip_branchId_status_deletedAt_idx" ON "Payslip"("branchId", "status", "deletedAt");
CREATE INDEX "Payslip_employeeId_status_idx" ON "Payslip"("employeeId", "status");
CREATE INDEX "LedgerEntry_branchId_accountId_entryDate_idx" ON "LedgerEntry"("branchId", "accountId", "entryDate");
