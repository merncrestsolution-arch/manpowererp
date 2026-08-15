import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

import { formatCurrency } from "@/lib/format";
import {
  PDF_FOOTER_ATTRIBUTION,
  PDF_GENERATED_NOTICE,
} from "@/lib/pdf-attribution";

import type { PayslipDetail } from "@/types/payroll";

export type PayslipPdfContext = {
  companyName: string;
  branchName: string;
};

export function getPayslipPdfStoragePath(payslipId: string): string {
  return path.join(process.cwd(), "storage", "payslips", `${payslipId}.pdf`);
}

export function getPayslipPdfUrl(payslipId: string): string {
  return `/api/payroll/payslips/${payslipId}/pdf`;
}

export async function generatePayslipPdf(
  payslip: PayslipDetail,
  context: PayslipPdfContext,
): Promise<{ filePath: string; pdfUrl: string }> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const margin = 48;
  let y = page.getHeight() - margin;

  const drawText = (
    text: string,
    x: number,
    size: number,
    bold = false,
    color = rgb(0.1, 0.1, 0.1),
  ) => {
    page.drawText(text, {
      x,
      y,
      size,
      font: bold ? fontBold : font,
      color,
    });
  };

  drawText(context.companyName, margin, 18, true, rgb(0.05, 0.25, 0.55));
  y -= 22;
  drawText(context.branchName, margin, 11);
  y -= 8;
  page.drawLine({
    start: { x: margin, y },
    end: { x: page.getWidth() - margin, y },
    thickness: 1,
    color: rgb(0.8, 0.85, 0.9),
  });
  y -= 24;

  drawText("PAYSLIP", margin, 16, true);
  drawText(payslip.payslipNo, page.getWidth() - margin - 100, 12, true);
  y -= 28;

  const periodLabel = `${new Date(payslip.periodStart).toLocaleDateString("en-LK")} – ${new Date(payslip.periodEnd).toLocaleDateString("en-LK")}`;
  drawText(`Pay period: ${periodLabel}`, margin, 10);
  y -= 16;
  drawText(
    `Pay date: ${new Date(payslip.payDate).toLocaleDateString("en-LK")}`,
    margin,
    10,
  );
  y -= 24;

  drawText("Employee details", margin, 12, true);
  y -= 18;
  drawText(`${payslip.employeeName} (${payslip.employeeNo})`, margin, 10);
  y -= 14;
  drawText(`Department: ${payslip.department ?? "—"}`, margin, 10);
  y -= 28;

  drawText("Earnings & deductions", margin, 12, true);
  y -= 20;

  const colLabel = margin;
  const colAmount = page.getWidth() - margin - 80;

  drawText("Description", colLabel, 9, true, rgb(0.4, 0.4, 0.4));
  drawText("Amount (LKR)", colAmount, 9, true, rgb(0.4, 0.4, 0.4));
  y -= 14;

  for (const item of payslip.lineItems) {
    drawText(item.label, colLabel, 10);
    drawText(formatCurrency(item.amount, "LKR"), colAmount, 10);
    y -= 16;
  }

  y -= 8;
  page.drawLine({
    start: { x: margin, y },
    end: { x: page.getWidth() - margin, y },
    thickness: 1,
    color: rgb(0.8, 0.85, 0.9),
  });
  y -= 20;

  const summaryRows = [
    ["Gross salary", payslip.grossSalary],
    ["Total deductions", payslip.totalDeductions],
  ];

  for (const [label, amount] of summaryRows) {
    drawText(String(label), colLabel, 10);
    drawText(formatCurrency(Number(amount), "LKR"), colAmount, 10);
    y -= 16;
  }

  y -= 8;
  page.drawRectangle({
    x: margin,
    y: y - 28,
    width: page.getWidth() - margin * 2,
    height: 36,
    color: rgb(0.93, 0.96, 1),
    borderColor: rgb(0.05, 0.25, 0.55),
    borderWidth: 1,
  });

  drawText("NET PAY", margin + 12, y - 10, true, rgb(0.05, 0.25, 0.55));
  drawText(
    formatCurrency(payslip.netSalary, "LKR"),
    colAmount,
    y - 10,
    true,
    rgb(0.05, 0.25, 0.55),
  );

  y -= 56;
  drawText(PDF_GENERATED_NOTICE, margin, 8, false, rgb(0.45, 0.45, 0.45));
  page.drawText(PDF_FOOTER_ATTRIBUTION, {
    x: margin,
    y: y - 14,
    size: 8,
    font,
    color: rgb(0.45, 0.45, 0.45),
  });

  const pdfBytes = await pdfDoc.save();
  const filePath = getPayslipPdfStoragePath(payslip.id);
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, pdfBytes);

  return { filePath, pdfUrl: getPayslipPdfUrl(payslip.id) };
}
