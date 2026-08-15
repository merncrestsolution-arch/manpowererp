import { mapPayslipToDetail } from "@/application/mappers/payroll-mapper";
import { postJournalEntry } from "@/application/use-cases/post-journal-entry";
import { prisma } from "@/infrastructure/db/prisma";
import { generatePayslipPdf } from "@/infrastructure/pdf/payslip-pdf-generator";
import { CHART_ACCOUNT_CODES } from "@/lib/chart-account-codes";

import type { PayslipDetail } from "@/types/payroll";

type FinalizePayslipParams = {
  branchId: string;
  payslipId: string;
  userId: string;
};

type FinalizePayslipResult =
  { success: true; payslip: PayslipDetail } | { success: false; error: string };

export async function finalizePayslip({
  branchId,
  payslipId,
  userId,
}: FinalizePayslipParams): Promise<FinalizePayslipResult> {
  const payslipRecord = await prisma.payslip.findFirst({
    where: { id: payslipId, branchId, deletedAt: null },
    include: {
      employee: {
        select: {
          employeeNo: true,
          firstName: true,
          lastName: true,
          department: true,
        },
      },
      payrollPeriod: {
        select: { periodStart: true, periodEnd: true, payDate: true },
      },
      lineItems: { orderBy: { type: "asc" } },
    },
  });

  if (!payslipRecord) {
    return { success: false, error: "Payslip not found" };
  }

  if (payslipRecord.status !== "DRAFT") {
    return { success: false, error: "Only draft payslips can be finalized" };
  }

  const payslipDetail = mapPayslipToDetail(payslipRecord);

  const branch = await prisma.branch.findFirst({
    where: { id: branchId },
    include: { organization: { select: { name: true } } },
  });

  const { pdfUrl } = await generatePayslipPdf(payslipDetail, {
    companyName: branch?.organization.name ?? "JK Manpower",
    branchName: branch?.name ?? "Head Office",
  });

  const updated = await prisma.payslip.update({
    where: { id: payslipId },
    data: {
      status: "FINALIZED",
      pdfUrl,
      updatedBy: userId,
    },
    include: {
      employee: {
        select: {
          employeeNo: true,
          firstName: true,
          lastName: true,
          department: true,
        },
      },
      payrollPeriod: {
        select: { periodStart: true, periodEnd: true, payDate: true },
      },
      lineItems: { orderBy: { type: "asc" } },
    },
  });

  await postJournalEntry({
    branchId,
    userId,
    reference: `PAY-${updated.payslipNo}`,
    date: updated.payrollPeriod.payDate,
    description: `Payroll finalized for ${updated.employee.firstName} ${updated.employee.lastName}`,
    sourceType: "PAYROLL",
    sourceId: payslipId,
    lines: [
      {
        accountCode: CHART_ACCOUNT_CODES.SALARY_EXPENSE,
        description: "Salary expense",
        debit: Number(updated.netSalary),
        credit: 0,
      },
      {
        accountCode: CHART_ACCOUNT_CODES.ACCOUNTS_PAYABLE,
        description: "Payroll payable",
        debit: 0,
        credit: Number(updated.netSalary),
      },
    ],
  });

  return { success: true, payslip: mapPayslipToDetail(updated) };
}

export async function finalizeAllDraftPayslips({
  branchId,
  periodId,
  userId,
}: {
  branchId: string;
  periodId: string;
  userId: string;
}): Promise<{ finalized: number; failed: number; errors: string[] }> {
  const drafts = await prisma.payslip.findMany({
    where: {
      branchId,
      payrollPeriodId: periodId,
      status: "DRAFT",
      deletedAt: null,
    },
    select: { id: true, payslipNo: true },
  });

  let finalized = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const draft of drafts) {
    const result = await finalizePayslip({
      branchId,
      payslipId: draft.id,
      userId,
    });

    if (result.success) {
      finalized += 1;
    } else {
      failed += 1;
      errors.push(`${draft.payslipNo}: ${result.error}`);
    }
  }

  if (finalized > 0) {
    const remainingDrafts = await prisma.payslip.count({
      where: {
        payrollPeriodId: periodId,
        status: "DRAFT",
        deletedAt: null,
      },
    });

    if (remainingDrafts === 0) {
      await prisma.payrollPeriod.update({
        where: { id: periodId },
        data: { status: "FINALIZED", updatedBy: userId },
      });
    }
  }

  return { finalized, failed, errors };
}
