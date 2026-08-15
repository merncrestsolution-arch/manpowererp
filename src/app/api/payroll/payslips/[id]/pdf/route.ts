import { readFile } from "node:fs/promises";

import { NextResponse } from "next/server";

import { getPayslip } from "@/application/use-cases/run-payroll";
import { getAuthenticatedContext } from "@/infrastructure/auth/api-auth";
import { canManagePayroll } from "@/infrastructure/auth/roles";
import { getPayslipPdfStoragePath } from "@/infrastructure/pdf/payslip-pdf-generator";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const auth = await getAuthenticatedContext();

  if (!auth || !canManagePayroll(auth.role)) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { id } = await context.params;
  const payslip = await getPayslip(auth.branchId, id);

  if (!payslip) {
    return new NextResponse("Payslip not found", { status: 404 });
  }

  try {
    const filePath = getPayslipPdfStoragePath(id);
    const pdfBytes = await readFile(filePath);

    return new NextResponse(pdfBytes, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${payslip.payslipNo}.pdf"`,
      },
    });
  } catch {
    return new NextResponse("PDF not found", { status: 404 });
  }
}
