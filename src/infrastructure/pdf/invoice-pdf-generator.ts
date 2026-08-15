import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

import { formatCurrency } from "@/lib/format";
import {
  PDF_FOOTER_ATTRIBUTION,
  PDF_GENERATED_NOTICE,
} from "@/lib/pdf-attribution";

import type { LineItemDetail } from "@/types/invoice";

export type BillingPdfContext = {
  companyName: string;
  branchName: string;
};

export type BillingPdfData = {
  id: string;
  documentNo: string;
  documentType: "QUOTATION" | "INVOICE";
  clientName: string;
  clientAddress: string | null;
  issueDate: string;
  secondaryDateLabel: string;
  secondaryDate: string;
  lineItems: LineItemDetail[];
  subtotal: number;
  taxAmount: number;
  total: number;
  notes: string | null;
  amountPaid?: number;
  amountDue?: number;
};

export function getInvoicePdfStoragePath(invoiceId: string): string {
  return path.join(process.cwd(), "storage", "invoices", `${invoiceId}.pdf`);
}

export function getQuotationPdfStoragePath(quotationId: string): string {
  return path.join(
    process.cwd(),
    "storage",
    "quotations",
    `${quotationId}.pdf`,
  );
}

export function getInvoicePdfUrl(invoiceId: string): string {
  return `/api/invoices/${invoiceId}/pdf`;
}

export function getQuotationPdfUrl(quotationId: string): string {
  return `/api/invoices/quotations/${quotationId}/pdf`;
}

export async function generateBillingPdf(
  data: BillingPdfData,
  context: BillingPdfContext,
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

  const title = data.documentType === "INVOICE" ? "INVOICE" : "QUOTATION";
  drawText(title, margin, 16, true);
  drawText(data.documentNo, page.getWidth() - margin - 120, 12, true);
  y -= 28;

  drawText(`Bill to: ${data.clientName}`, margin, 11, true);
  y -= 16;
  if (data.clientAddress) {
    drawText(data.clientAddress, margin, 10);
    y -= 16;
  }

  drawText(
    `Issue date: ${new Date(data.issueDate).toLocaleDateString("en-LK")}`,
    margin,
    10,
  );
  y -= 14;
  drawText(
    `${data.secondaryDateLabel}: ${new Date(data.secondaryDate).toLocaleDateString("en-LK")}`,
    margin,
    10,
  );
  y -= 24;

  const colDesc = margin;
  const colQty = page.getWidth() - margin - 220;
  const colPrice = page.getWidth() - margin - 140;
  const colTotal = page.getWidth() - margin - 70;

  drawText("Description", colDesc, 9, true, rgb(0.4, 0.4, 0.4));
  drawText("Qty", colQty, 9, true, rgb(0.4, 0.4, 0.4));
  drawText("Unit", colPrice, 9, true, rgb(0.4, 0.4, 0.4));
  drawText("Total", colTotal, 9, true, rgb(0.4, 0.4, 0.4));
  y -= 14;

  for (const item of data.lineItems) {
    drawText(item.description.slice(0, 50), colDesc, 10);
    drawText(String(item.quantity), colQty, 10);
    drawText(formatCurrency(item.unitPrice, "LKR"), colPrice, 10);
    drawText(formatCurrency(item.lineTotal, "LKR"), colTotal, 10);
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

  const summaryX = page.getWidth() - margin - 180;
  drawText("Subtotal", summaryX, 10);
  drawText(formatCurrency(data.subtotal, "LKR"), colTotal, 10);
  y -= 16;
  drawText("Tax", summaryX, 10);
  drawText(formatCurrency(data.taxAmount, "LKR"), colTotal, 10);
  y -= 16;
  drawText("Total", summaryX, 11, true);
  drawText(formatCurrency(data.total, "LKR"), colTotal, 11, true);
  y -= 20;

  if (data.documentType === "INVOICE" && data.amountPaid !== undefined) {
    drawText("Amount paid", summaryX, 10);
    drawText(formatCurrency(data.amountPaid, "LKR"), colTotal, 10);
    y -= 16;
    drawText("Amount due", summaryX, 11, true, rgb(0.05, 0.25, 0.55));
    drawText(
      formatCurrency(data.amountDue ?? 0, "LKR"),
      colTotal,
      11,
      true,
      rgb(0.05, 0.25, 0.55),
    );
    y -= 24;
  }

  if (data.notes) {
    drawText("Notes / Terms", margin, 10, true);
    y -= 14;
    drawText(data.notes.slice(0, 200), margin, 9, false, rgb(0.45, 0.45, 0.45));
    y -= 24;
  }

  drawText(PDF_GENERATED_NOTICE, margin, 8, false, rgb(0.45, 0.45, 0.45));
  page.drawText(PDF_FOOTER_ATTRIBUTION, {
    x: margin,
    y: y - 14,
    size: 8,
    font,
    color: rgb(0.45, 0.45, 0.45),
  });

  const pdfBytes = await pdfDoc.save();
  const filePath =
    data.documentType === "INVOICE"
      ? getInvoicePdfStoragePath(data.id)
      : getQuotationPdfStoragePath(data.id);
  const pdfUrl =
    data.documentType === "INVOICE"
      ? getInvoicePdfUrl(data.id)
      : getQuotationPdfUrl(data.id);

  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, pdfBytes);

  return { filePath, pdfUrl };
}
