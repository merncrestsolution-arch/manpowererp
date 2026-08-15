import { readFile } from "node:fs/promises";

import { NextResponse } from "next/server";

import { getPayslip } from "@/application/use-cases/run-payroll";
import { requireMobileEmployee } from "@/infrastructure/auth/mobile-auth";
import { getPayslipPdfStoragePath } from "@/infrastructure/pdf/payslip-pdf-generator";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: RouteContext) {
  const mobileContext = await requireMobileEmployee(request);

  if (!mobileContext) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { id } = await context.params;
  const payslip = await getPayslip(mobileContext.branchId, id);

  if (!payslip || payslip.employeeId !== mobileContext.employee.id) {
    return new NextResponse("Payslip not found", { status: 404 });
  }

  if (payslip.status === "DRAFT") {
    return new NextResponse("Payslip not available", { status: 403 });
  }

  try {
    const filePath = getPayslipPdfStoragePath(id);
    const pdfBytes = await readFile(filePath);

    return new NextResponse(pdfBytes, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${payslip.payslipNo}.pdf"`,
      },
    });
  } catch {
    return new NextResponse("PDF not found", { status: 404 });
  }
}
