-- CreateEnum
CREATE TYPE "ClientStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'BLACKLISTED');

-- CreateEnum
CREATE TYPE "ClientContractStatus" AS ENUM ('DRAFT', 'ACTIVE', 'EXPIRED', 'TERMINATED');

-- CreateEnum
CREATE TYPE "ClientWorkerAssignmentStatus" AS ENUM ('ACTIVE', 'ENDED');

-- CreateEnum
CREATE TYPE "ClientBillingStatus" AS ENUM ('PENDING', 'INVOICED', 'PAID');

-- CreateTable
CREATE TABLE "Client" (
    "id" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "clientNo" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "registrationNo" TEXT,
    "industry" TEXT,
    "address" TEXT,
    "city" TEXT,
    "status" "ClientStatus" NOT NULL DEFAULT 'ACTIVE',
    "creditTermDays" INTEGER NOT NULL DEFAULT 30,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientContact" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "designation" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "ClientContact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientContract" (
    "id" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "contractNo" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "status" "ClientContractStatus" NOT NULL DEFAULT 'DRAFT',
    "fileUrl" TEXT,
    "terms" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "ClientContract_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientWorkerAssignment" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "assignedFrom" TIMESTAMP(3) NOT NULL,
    "assignedTo" TIMESTAMP(3),
    "role" TEXT NOT NULL,
    "status" "ClientWorkerAssignmentStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "ClientWorkerAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientBillingRecord" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "status" "ClientBillingStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "ClientBillingRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Client_branchId_idx" ON "Client"("branchId");

-- CreateIndex
CREATE INDEX "Client_deletedAt_idx" ON "Client"("deletedAt");

-- CreateIndex
CREATE INDEX "Client_status_idx" ON "Client"("status");

-- CreateIndex
CREATE INDEX "Client_industry_idx" ON "Client"("industry");

-- CreateIndex
CREATE INDEX "Client_companyName_idx" ON "Client"("companyName");

-- CreateIndex
CREATE INDEX "Client_city_idx" ON "Client"("city");

-- CreateIndex
CREATE UNIQUE INDEX "Client_branchId_clientNo_key" ON "Client"("branchId", "clientNo");

-- CreateIndex
CREATE INDEX "ClientContact_clientId_idx" ON "ClientContact"("clientId");

-- CreateIndex
CREATE INDEX "ClientContact_deletedAt_idx" ON "ClientContact"("deletedAt");

-- CreateIndex
CREATE INDEX "ClientContact_isPrimary_idx" ON "ClientContact"("isPrimary");

-- CreateIndex
CREATE INDEX "ClientContract_clientId_idx" ON "ClientContract"("clientId");

-- CreateIndex
CREATE INDEX "ClientContract_branchId_idx" ON "ClientContract"("branchId");

-- CreateIndex
CREATE INDEX "ClientContract_status_idx" ON "ClientContract"("status");

-- CreateIndex
CREATE INDEX "ClientContract_endDate_idx" ON "ClientContract"("endDate");

-- CreateIndex
CREATE INDEX "ClientContract_deletedAt_idx" ON "ClientContract"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "ClientContract_branchId_contractNo_key" ON "ClientContract"("branchId", "contractNo");

-- CreateIndex
CREATE INDEX "ClientWorkerAssignment_clientId_idx" ON "ClientWorkerAssignment"("clientId");

-- CreateIndex
CREATE INDEX "ClientWorkerAssignment_employeeId_idx" ON "ClientWorkerAssignment"("employeeId");

-- CreateIndex
CREATE INDEX "ClientWorkerAssignment_status_idx" ON "ClientWorkerAssignment"("status");

-- CreateIndex
CREATE INDEX "ClientWorkerAssignment_assignedFrom_idx" ON "ClientWorkerAssignment"("assignedFrom");

-- CreateIndex
CREATE INDEX "ClientWorkerAssignment_deletedAt_idx" ON "ClientWorkerAssignment"("deletedAt");

-- CreateIndex
CREATE INDEX "ClientBillingRecord_clientId_idx" ON "ClientBillingRecord"("clientId");

-- CreateIndex
CREATE INDEX "ClientBillingRecord_status_idx" ON "ClientBillingRecord"("status");

-- CreateIndex
CREATE INDEX "ClientBillingRecord_periodStart_idx" ON "ClientBillingRecord"("periodStart");

-- CreateIndex
CREATE INDEX "ClientBillingRecord_deletedAt_idx" ON "ClientBillingRecord"("deletedAt");

-- AddForeignKey
ALTER TABLE "Client" ADD CONSTRAINT "Client_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientContact" ADD CONSTRAINT "ClientContact_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientContract" ADD CONSTRAINT "ClientContract_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientWorkerAssignment" ADD CONSTRAINT "ClientWorkerAssignment_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientWorkerAssignment" ADD CONSTRAINT "ClientWorkerAssignment_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientBillingRecord" ADD CONSTRAINT "ClientBillingRecord_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;
