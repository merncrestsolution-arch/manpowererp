-- CreateEnum
CREATE TYPE "AttendanceCheckMethod" AS ENUM ('QR', 'GPS', 'MANUAL');

-- CreateEnum
CREATE TYPE "AttendanceStatus" AS ENUM ('PRESENT', 'LATE', 'ABSENT', 'HALF_DAY', 'ON_LEAVE');

-- CreateEnum
CREATE TYPE "OvertimeStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "AttendanceRecord" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "deploymentId" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "checkInAt" TIMESTAMP(3),
    "checkOutAt" TIMESTAMP(3),
    "checkInMethod" "AttendanceCheckMethod",
    "checkOutMethod" "AttendanceCheckMethod",
    "checkInLat" DECIMAL(10,7),
    "checkInLng" DECIMAL(10,7),
    "checkOutLat" DECIMAL(10,7),
    "checkOutLng" DECIMAL(10,7),
    "status" "AttendanceStatus" NOT NULL DEFAULT 'ABSENT',
    "enteredById" TEXT,
    "manualReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "AttendanceRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OvertimeRecord" (
    "id" TEXT NOT NULL,
    "attendanceRecordId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "hours" DECIMAL(6,2) NOT NULL,
    "rateMultiplier" DECIMAL(4,2) NOT NULL DEFAULT 1.5,
    "approvedById" TEXT,
    "status" "OvertimeStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,

    CONSTRAINT "OvertimeRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QrCheckpoint" (
    "id" TEXT NOT NULL,
    "workLocationId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,

    CONSTRAINT "QrCheckpoint_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AttendanceRecord_employeeId_date_key" ON "AttendanceRecord"("employeeId", "date");

-- CreateIndex
CREATE INDEX "AttendanceRecord_employeeId_idx" ON "AttendanceRecord"("employeeId");

-- CreateIndex
CREATE INDEX "AttendanceRecord_deploymentId_idx" ON "AttendanceRecord"("deploymentId");

-- CreateIndex
CREATE INDEX "AttendanceRecord_date_idx" ON "AttendanceRecord"("date");

-- CreateIndex
CREATE INDEX "AttendanceRecord_status_idx" ON "AttendanceRecord"("status");

-- CreateIndex
CREATE INDEX "AttendanceRecord_enteredById_idx" ON "AttendanceRecord"("enteredById");

-- CreateIndex
CREATE INDEX "AttendanceRecord_deletedAt_idx" ON "AttendanceRecord"("deletedAt");

-- CreateIndex
CREATE INDEX "OvertimeRecord_attendanceRecordId_idx" ON "OvertimeRecord"("attendanceRecordId");

-- CreateIndex
CREATE INDEX "OvertimeRecord_employeeId_idx" ON "OvertimeRecord"("employeeId");

-- CreateIndex
CREATE INDEX "OvertimeRecord_status_idx" ON "OvertimeRecord"("status");

-- CreateIndex
CREATE INDEX "OvertimeRecord_approvedById_idx" ON "OvertimeRecord"("approvedById");

-- CreateIndex
CREATE UNIQUE INDEX "QrCheckpoint_code_key" ON "QrCheckpoint"("code");

-- CreateIndex
CREATE INDEX "QrCheckpoint_workLocationId_idx" ON "QrCheckpoint"("workLocationId");

-- CreateIndex
CREATE INDEX "QrCheckpoint_isActive_idx" ON "QrCheckpoint"("isActive");

-- CreateIndex
CREATE INDEX "QrCheckpoint_expiresAt_idx" ON "QrCheckpoint"("expiresAt");

-- AddForeignKey
ALTER TABLE "AttendanceRecord" ADD CONSTRAINT "AttendanceRecord_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttendanceRecord" ADD CONSTRAINT "AttendanceRecord_deploymentId_fkey" FOREIGN KEY ("deploymentId") REFERENCES "Deployment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttendanceRecord" ADD CONSTRAINT "AttendanceRecord_enteredById_fkey" FOREIGN KEY ("enteredById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OvertimeRecord" ADD CONSTRAINT "OvertimeRecord_attendanceRecordId_fkey" FOREIGN KEY ("attendanceRecordId") REFERENCES "AttendanceRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OvertimeRecord" ADD CONSTRAINT "OvertimeRecord_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OvertimeRecord" ADD CONSTRAINT "OvertimeRecord_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QrCheckpoint" ADD CONSTRAINT "QrCheckpoint_workLocationId_fkey" FOREIGN KEY ("workLocationId") REFERENCES "WorkLocation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
