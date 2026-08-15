import { NextResponse } from "next/server";

import { getExpenseById } from "@/application/use-cases/list-expenses";
import { getAuthenticatedContext } from "@/infrastructure/auth/api-auth";
import { canSubmitExpense } from "@/infrastructure/auth/roles";
import { generateExpensePdf } from "@/infrastructure/pdf/expense-pdf-generator";
import { getBillingPdfContext } from "@/infrastructure/pdf/quotation-pdf-generator";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const auth = await getAuthenticatedContext();

  if (!auth || !canSubmitExpense(auth.role)) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { id } = await context.params;
  const expense = await getExpenseById(auth.branchId, id);

  if (!expense) {
    return new NextResponse("Expense not found", { status: 404 });
  }

  const billing = await getBillingPdfContext(auth.branchId);
  const pdfBytes = await generateExpensePdf(expense, {
    companyName: billing.companyName,
  });

  return new NextResponse(Buffer.from(pdfBytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${expense.expenseNo}.pdf"`,
    },
  });
}
