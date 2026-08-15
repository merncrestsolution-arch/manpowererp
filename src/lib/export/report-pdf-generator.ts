import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

import { PDF_FOOTER_ATTRIBUTION } from "@/lib/pdf-attribution";

export type ReportPdfColumn = {
  header: string;
  width: number;
};

export type ReportPdfOptions = {
  title: string;
  subtitle?: string;
  filters?: string[];
  columns: ReportPdfColumn[];
  rows: string[][];
  footer?: string;
};

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }
  return `${text.slice(0, maxLength - 1)}…`;
}

export async function generateReportPdf(
  options: ReportPdfOptions,
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const margin = 48;
  const pageWidth = 595.28;
  const pageHeight = 841.89;
  const contentWidth = pageWidth - margin * 2;
  const rowHeight = 18;
  const headerHeight = 22;

  let page = pdfDoc.addPage([pageWidth, pageHeight]);
  let y = pageHeight - margin;

  const drawLine = (yPos: number) => {
    page.drawLine({
      start: { x: margin, y: yPos },
      end: { x: pageWidth - margin, y: yPos },
      thickness: 0.5,
      color: rgb(0.85, 0.85, 0.85),
    });
  };

  const ensureSpace = (needed: number) => {
    if (y - needed < margin + 30) {
      page = pdfDoc.addPage([pageWidth, pageHeight]);
      y = pageHeight - margin;
    }
  };

  page.drawText(options.title, {
    x: margin,
    y,
    size: 16,
    font: fontBold,
    color: rgb(0.05, 0.25, 0.55),
  });
  y -= 22;

  if (options.subtitle) {
    page.drawText(options.subtitle, {
      x: margin,
      y,
      size: 10,
      font,
      color: rgb(0.35, 0.35, 0.35),
    });
    y -= 16;
  }

  if (options.filters?.length) {
    for (const filter of options.filters) {
      page.drawText(filter, {
        x: margin,
        y,
        size: 9,
        font,
        color: rgb(0.45, 0.45, 0.45),
      });
      y -= 12;
    }
  }

  y -= 8;
  drawLine(y);
  y -= headerHeight;

  const totalWidth = options.columns.reduce(
    (sum, column) => sum + column.width,
    0,
  );
  const scale = contentWidth / totalWidth;

  const drawTableHeader = () => {
    let x = margin;
    for (const column of options.columns) {
      const width = column.width * scale;
      page.drawText(truncateText(column.header, Math.floor(width / 5)), {
        x: x + 2,
        y,
        size: 9,
        font: fontBold,
        color: rgb(0.15, 0.15, 0.15),
      });
      x += width;
    }
    y -= 6;
    drawLine(y);
    y -= rowHeight;
  };

  drawTableHeader();

  for (const row of options.rows) {
    ensureSpace(rowHeight + 4);
    let x = margin;
    row.forEach((cell, index) => {
      const column = options.columns[index];
      if (!column) {
        return;
      }
      const width = column.width * scale;
      page.drawText(truncateText(cell, Math.floor(width / 4.5)), {
        x: x + 2,
        y,
        size: 8,
        font,
        color: rgb(0.2, 0.2, 0.2),
      });
      x += width;
    });
    y -= rowHeight;
  }

  const footerText = options.footer
    ? `${options.footer} | ${PDF_FOOTER_ATTRIBUTION}`
    : PDF_FOOTER_ATTRIBUTION;

  ensureSpace(30);
  y -= 10;
  drawLine(y);
  y -= 14;
  page.drawText(footerText, {
    x: margin,
    y,
    size: 8,
    font,
    color: rgb(0.5, 0.5, 0.5),
  });

  return pdfDoc.save();
}

export async function downloadReportPdf(
  filename: string,
  options: ReportPdfOptions,
): Promise<void> {
  const bytes = await generateReportPdf(options);
  const blob = new Blob([Uint8Array.from(bytes)], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename.endsWith(".pdf") ? filename : `${filename}.pdf`;
  link.click();
  URL.revokeObjectURL(url);
}
