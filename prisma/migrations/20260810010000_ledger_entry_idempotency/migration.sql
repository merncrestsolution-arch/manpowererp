-- CreateIndex
CREATE UNIQUE INDEX "LedgerEntry_branchId_sourceType_sourceId_key" ON "LedgerEntry"("branchId", "sourceType", "sourceId");

-- DropIndex
DROP INDEX "LedgerEntry_sourceType_sourceId_idx";
