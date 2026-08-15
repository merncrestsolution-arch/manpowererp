-- CreateEnum
CREATE TYPE "WorkLocationStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "DeploymentStatus" AS ENUM ('SCHEDULED', 'ACTIVE', 'COMPLETED', 'CANCELLED');

-- CreateTable
CREATE TABLE "WorkLocation" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "city" TEXT,
    "geoLat" DECIMAL(10,7),
    "geoLng" DECIMAL(10,7),
    "status" "WorkLocationStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "WorkLocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Deployment" (
    "id" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "deploymentNo" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "workLocationId" TEXT NOT NULL,
    "shiftId" TEXT NOT NULL,
    "clientWorkerAssignmentId" TEXT,
    "contractRefId" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "status" "DeploymentStatus" NOT NULL DEFAULT 'SCHEDULED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Deployment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeploymentContract" (
    "id" TEXT NOT NULL,
    "deploymentId" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "signedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "DeploymentContract_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WorkLocation_clientId_idx" ON "WorkLocation"("clientId");

-- CreateIndex
CREATE INDEX "WorkLocation_status_idx" ON "WorkLocation"("status");

-- CreateIndex
CREATE INDEX "WorkLocation_deletedAt_idx" ON "WorkLocation"("deletedAt");

-- CreateIndex
CREATE INDEX "WorkLocation_name_idx" ON "WorkLocation"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Deployment_clientWorkerAssignmentId_key" ON "Deployment"("clientWorkerAssignmentId");

-- CreateIndex
CREATE INDEX "Deployment_branchId_idx" ON "Deployment"("branchId");

-- CreateIndex
CREATE INDEX "Deployment_employeeId_idx" ON "Deployment"("employeeId");

-- CreateIndex
CREATE INDEX "Deployment_clientId_idx" ON "Deployment"("clientId");

-- CreateIndex
CREATE INDEX "Deployment_workLocationId_idx" ON "Deployment"("workLocationId");

-- CreateIndex
CREATE INDEX "Deployment_shiftId_idx" ON "Deployment"("shiftId");

-- CreateIndex
CREATE INDEX "Deployment_contractRefId_idx" ON "Deployment"("contractRefId");

-- CreateIndex
CREATE INDEX "Deployment_status_idx" ON "Deployment"("status");

-- CreateIndex
CREATE INDEX "Deployment_startDate_idx" ON "Deployment"("startDate");

-- CreateIndex
CREATE INDEX "Deployment_endDate_idx" ON "Deployment"("endDate");

-- CreateIndex
CREATE INDEX "Deployment_deletedAt_idx" ON "Deployment"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Deployment_branchId_deploymentNo_key" ON "Deployment"("branchId", "deploymentNo");

-- CreateIndex
CREATE INDEX "DeploymentContract_deploymentId_idx" ON "DeploymentContract"("deploymentId");

-- CreateIndex
CREATE INDEX "DeploymentContract_expiresAt_idx" ON "DeploymentContract"("expiresAt");

-- CreateIndex
CREATE INDEX "DeploymentContract_deletedAt_idx" ON "DeploymentContract"("deletedAt");

-- AddForeignKey
ALTER TABLE "WorkLocation" ADD CONSTRAINT "WorkLocation_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deployment" ADD CONSTRAINT "Deployment_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deployment" ADD CONSTRAINT "Deployment_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deployment" ADD CONSTRAINT "Deployment_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deployment" ADD CONSTRAINT "Deployment_workLocationId_fkey" FOREIGN KEY ("workLocationId") REFERENCES "WorkLocation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deployment" ADD CONSTRAINT "Deployment_shiftId_fkey" FOREIGN KEY ("shiftId") REFERENCES "Shift"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deployment" ADD CONSTRAINT "Deployment_clientWorkerAssignmentId_fkey" FOREIGN KEY ("clientWorkerAssignmentId") REFERENCES "ClientWorkerAssignment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deployment" ADD CONSTRAINT "Deployment_contractRefId_fkey" FOREIGN KEY ("contractRefId") REFERENCES "ClientContract"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeploymentContract" ADD CONSTRAINT "DeploymentContract_deploymentId_fkey" FOREIGN KEY ("deploymentId") REFERENCES "Deployment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
