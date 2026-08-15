"use client";

import { Download, FileText } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { downloadCsv, type CsvColumn } from "@/lib/export/csv-export";
import {
  downloadReportPdf,
  type ReportPdfColumn,
} from "@/lib/export/report-pdf-generator";

type ExportToolbarProps = {
  reportTitle: string;
  subtitle?: string;
  filters?: string[];
  csvFilename: string;
  csvColumns: CsvColumn<Record<string, unknown>>[];
  csvRows: Record<string, unknown>[];
  pdfColumns?: ReportPdfColumn[];
  pdfRows?: string[][];
  disabled?: boolean;
};

export function ExportToolbar({
  reportTitle,
  subtitle,
  filters,
  csvFilename,
  csvColumns,
  csvRows,
  pdfColumns,
  pdfRows,
  disabled = false,
}: ExportToolbarProps) {
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const handleCsvExport = () => {
    downloadCsv(csvFilename, csvColumns, csvRows);
  };

  const handlePdfExport = async () => {
    if (!pdfColumns?.length || !pdfRows) {
      return;
    }

    setIsExportingPdf(true);
    try {
      await downloadReportPdf(csvFilename.replace(/\.csv$/, ""), {
        title: reportTitle,
        subtitle,
        filters,
        columns: pdfColumns,
        rows: pdfRows,
        footer: `Generated on ${new Date().toLocaleString("en-LK")}`,
      });
    } finally {
      setIsExportingPdf(false);
    }
  };

  const canExportPdf = Boolean(pdfColumns?.length && pdfRows?.length);

  return (
    <div className="gap-jk-sm flex flex-wrap items-center">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleCsvExport}
        disabled={disabled || csvRows.length === 0}
      >
        <Download className="mr-2 size-4" />
        Export CSV
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => void handlePdfExport()}
        disabled={disabled || !canExportPdf || isExportingPdf}
      >
        <FileText className="mr-2 size-4" />
        {isExportingPdf ? "Exporting…" : "Export PDF"}
      </Button>
    </div>
  );
}
