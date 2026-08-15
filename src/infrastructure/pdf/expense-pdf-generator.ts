import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

import { formatCurrency } from "@/lib/format";
import {
  PDF_FOOTER_ATTRIBUTION,
  PDF_GENERATED_NOTICE,
} from "@/lib/pdf-attribution";

import type { ExpenseDetail } from "@/types/expense";

type ExpensePdfContext = {
  companyName: string;
};

export async function generateExpensePdf(
  expense: ExpenseDetail,
  context: ExpensePdfContext,
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const navy = rgb(0.016, 0.078, 0.2);
  const muted = rgb(0.26, 0.27, 0.33);

  const margin = 48;
  let y = page.getHeight() - margin;

  const draw = (text: string, size: number, bold = false, color = navy) => {
    page.drawText(text, {
      x: margin,
      y,
      size,
      font: bold ? fontBold : font,
      color,
    });
    y -= size + 8;
  };

  draw(context.companyName, 11, true, muted);
  draw("EXPENSE BILL", 20, true);
  y -= 8;
  draw(expense.expenseNo, 14, true);
  draw(`Status: ${expense.status}`, 11, false, muted);
  y -= 12;

  const rows: Array<[string, string]> = [
    ["Category", expense.categoryName],
    ["Description", expense.description],
    ["Amount", formatCurrency(expense.amount)],
    ["Date", new Date(expense.expenseDate).toLocaleDateString("en-LK")],
    ["Submitted by", expense.paidByName],
  ];

  if (expense.approvedByName) {
    rows.push(["Reviewed by", expense.approvedByName]);
  }

  for (const [label, value] of rows) {
    page.drawText(label, {
      x: margin,
      y,
      size: 10,
      font: fontBold,
      color: muted,
    });
    page.drawText(value.slice(0, 70), {
      x: margin + 140,
      y,
      size: 11,
      font,
      color: navy,
    });
    y -= 22;
  }

  y -= 24;
  page.drawText(PDF_GENERATED_NOTICE, {
    x: margin,
    y,
    size: 8,
    font,
    color: muted,
  });
  page.drawText(PDF_FOOTER_ATTRIBUTION, {
    x: margin,
    y: 36,
    size: 8,
    font,
    color: muted,
  });

  return pdfDoc.save();
}
