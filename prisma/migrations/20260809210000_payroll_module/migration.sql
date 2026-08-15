-- CreateEnum
CREATE TYPE "PayrollPeriodStatus" AS ENUM ('DRAFT', 'PROCESSING', 'FINALIZED', 'PAID');

-- CreateEnum
CREATE TYPE "SalaryComponentType" AS ENUM ('ALLOWANCE', 'DEDUCTION');

-- CreateEnum
CREATE TYPE "SalaryCalculationType" AS ENUM ('FIXED', 'PERCENTAGE_OF_BASIC');

-- CreateEnum
CREATE TYPE "PayslipStatus" AS ENUM ('DRAFT', 'FINALIZED', 'PAID');

-- CreateEnum
CREATE TYPE "PayslipLineItemType" AS ENUM ('BASIC', 'ALLOWANCE', 'DEDUCTION', 'OVERTIME');

-- CreateTable
CREATE TABLE "PayrollPeriod" (
    "id" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "payDate" TIMESTAMP(3) NOT NULL,
    "status" "PayrollPeriodStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "PayrollPeriod_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalaryComponent" (
    "id" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "SalaryComponentType" NOT NULL,
    "calculationType" "SalaryCalculationType" NOT NULL,
    "defaultValue" DECIMAL(12,2) NOT NULL,
    "isTaxable" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "SalaryComponent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmployeeSalaryComponent" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "salaryComponentId" TEXT NOT NULL,
    "value" DECIMAL(12,2),
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "effectiveTo" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "EmployeeSalaryComponent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payslip" (
    "id" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "payslipNo" TEXT NOT NULL,
    "payrollPeriodId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "basicSalary" DECIMAL(12,2) NOT NULL,
    "totalAllowances" DECIMAL(12,2) NOT NULL,
    "totalDeductions" DECIMAL(12,2) NOT NULL,
    "overtimePay" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "grossSalary" DECIMAL(12,2) NOT NULL,
    "netSalary" DECIMAL(12,2) NOT NULL,
    "status" "PayslipStatus" NOT NULL DEFAULT 'DRAFT',
    "pdfUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Payslip_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PayslipLineItem" (
    "id" TEXT NOT NULL,
    "payslipId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "type" "PayslipLineItemType" NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "isTaxable" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "PayslipLineItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PayrollPeriod_branchId_idx" ON "PayrollPeriod"("branchId");

-- CreateIndex
CREATE INDEX "PayrollPeriod_status_idx" ON "PayrollPeriod"("status");

-- CreateIndex
CREATE INDEX "PayrollPeriod_periodStart_idx" ON "PayrollPeriod"("periodStart");

-- CreateIndex
CREATE INDEX "PayrollPeriod_periodEnd_idx" ON "PayrollPeriod"("periodEnd");

-- CreateIndex
CREATE INDEX "PayrollPeriod_deletedAt_idx" ON "PayrollPeriod"("deletedAt");

-- CreateIndex
CREATE INDEX "SalaryComponent_branchId_idx" ON "SalaryComponent"("branchId");

-- CreateIndex
CREATE INDEX "SalaryComponent_type_idx" ON "SalaryComponent"("type");

-- CreateIndex
CREATE INDEX "SalaryComponent_isActive_idx" ON "SalaryComponent"("isActive");

-- CreateIndex
CREATE INDEX "SalaryComponent_deletedAt_idx" ON "SalaryComponent"("deletedAt");

-- CreateIndex
CREATE INDEX "EmployeeSalaryComponent_employeeId_idx" ON "EmployeeSalaryComponent"("employeeId");

-- CreateIndex
CREATE INDEX "EmployeeSalaryComponent_salaryComponentId_idx" ON "EmployeeSalaryComponent"("salaryComponentId");

-- CreateIndex
CREATE INDEX "EmployeeSalaryComponent_effectiveFrom_idx" ON "EmployeeSalaryComponent"("effectiveFrom");

-- CreateIndex
CREATE INDEX "EmployeeSalaryComponent_deletedAt_idx" ON "EmployeeSalaryComponent"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Payslip_branchId_payslipNo_key" ON "Payslip"("branchId", "payslipNo");

-- CreateIndex
CREATE UNIQUE INDEX "Payslip_payrollPeriodId_employeeId_key" ON "Payslip"("payrollPeriodId", "employeeId");

-- CreateIndex
CREATE INDEX "Payslip_branchId_idx" ON "Payslip"("branchId");

-- CreateIndex
CREATE INDEX "Payslip_payrollPeriodId_idx" ON "Payslip"("payrollPeriodId");

-- CreateIndex
CREATE INDEX "Payslip_employeeId_idx" ON "Payslip"("employeeId");

-- CreateIndex
CREATE INDEX "Payslip_status_idx" ON "Payslip"("status");

-- CreateIndex
CREATE INDEX "Payslip_deletedAt_idx" ON "Payslip"("deletedAt");

-- CreateIndex
CREATE INDEX "PayslipLineItem_payslipId_idx" ON "PayslipLineItem"("payslipId");

-- AddForeignKey
ALTER TABLE "PayrollPeriod" ADD CONSTRAINT "PayrollPeriod_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalaryComponent" ADD CONSTRAINT "SalaryComponent_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeSalaryComponent" ADD CONSTRAINT "EmployeeSalaryComponent_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeSalaryComponent" ADD CONSTRAINT "EmployeeSalaryComponent_salaryComponentId_fkey" FOREIGN KEY ("salaryComponentId") REFERENCES "SalaryComponent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payslip" ADD CONSTRAINT "Payslip_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payslip" ADD CONSTRAINT "Payslip_payrollPeriodId_fkey" FOREIGN KEY ("payrollPeriodId") REFERENCES "PayrollPeriod"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payslip" ADD CONSTRAINT "Payslip_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayslipLineItem" ADD CONSTRAINT "PayslipLineItem_payslipId_fkey" FOREIGN KEY ("payslipId") REFERENCES "Payslip"("id") ON DELETE CASCADE ON UPDATE CASCADE;
