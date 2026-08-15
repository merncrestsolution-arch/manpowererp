import { prisma } from "@/infrastructure/db/prisma";

import type { Prisma } from "@prisma/client";

export async function getNextSequenceValue(
  tx: Prisma.TransactionClient,
  branchId: string,
  key: string,
): Promise<number> {
  await tx.sequence.upsert({
    where: {
      branchId_key: { branchId, key },
    },
    create: {
      branchId,
      key,
      value: 0,
    },
    update: {},
  });

  const updated = await tx.sequence.update({
    where: {
      branchId_key: { branchId, key },
    },
    data: {
      value: { increment: 1 },
    },
  });

  return updated.value;
}

export function formatEmployeeNo(sequenceValue: number): string {
  return `EMP-${String(sequenceValue).padStart(5, "0")}`;
}

export function formatClientNo(sequenceValue: number): string {
  return `CLT-${String(sequenceValue).padStart(5, "0")}`;
}

export function formatContractNo(sequenceValue: number): string {
  return `CTR-${String(sequenceValue).padStart(5, "0")}`;
}

export function formatCandidateNo(sequenceValue: number): string {
  return `CAN-${String(sequenceValue).padStart(5, "0")}`;
}

export function formatDeploymentNo(sequenceValue: number): string {
  return `DEP-${String(sequenceValue).padStart(5, "0")}`;
}

export function formatExpenseNo(sequenceValue: number): string {
  return `EXP-${String(sequenceValue).padStart(5, "0")}`;
}

export function formatPayslipNo(sequenceValue: number): string {
  return `PSL-${String(sequenceValue).padStart(5, "0")}`;
}

export function formatQuotationNo(sequenceValue: number): string {
  return `QUO-${String(sequenceValue).padStart(5, "0")}`;
}

export function formatInvoiceNo(sequenceValue: number): string {
  return `INV-${String(sequenceValue).padStart(5, "0")}`;
}

export function formatPaymentNo(sequenceValue: number): string {
  return `PAY-${String(sequenceValue).padStart(5, "0")}`;
}

export async function resolveBranchIdForUser(userId: string): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { branchId: true },
  });

  if (user?.branchId) {
    return user.branchId;
  }

  const defaultBranch = await prisma.branch.findFirst({
    where: { deletedAt: null },
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });

  if (!defaultBranch) {
    throw new Error("No branch configured for this organization");
  }

  return defaultBranch.id;
}
