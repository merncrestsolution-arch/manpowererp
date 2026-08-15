"use client";

import { ExportToolbar } from "@/components/reports/export-toolbar";

import type { TimeToHireReport } from "@/types/reports";

type TimeToHireReportViewProps = {
  report?: TimeToHireReport;
  isLoading?: boolean;
};

export function TimeToHireReportView({
  report,
  isLoading = false,
}: TimeToHireReportViewProps) {
  if (isLoading || !report) {
    return <div className="bg-muted/40 h-48 animate-pulse rounded-lg border" />;
  }

  const csvRows = report.placements.map((placement) => ({
    candidateNo: placement.candidateNo,
    name: placement.name,
    daysToHire: placement.daysToHire,
    source: placement.source,
    placedAt: new Date(placement.placedAt).toLocaleDateString("en-LK"),
  }));

  return (
    <div className="space-y-jk-md">
      <div className="gap-jk-sm flex flex-wrap items-center justify-between">
        <div className="gap-jk-md grid sm:grid-cols-3">
          <div className="px-jk-md py-jk-sm rounded-lg border">
            <p className="text-label-md text-muted-foreground">Average days</p>
            <p className="font-heading text-headline-sm">
              {report.averageDays}
            </p>
          </div>
          <div className="px-jk-md py-jk-sm rounded-lg border">
            <p className="text-label-md text-muted-foreground">Median days</p>
            <p className="font-heading text-headline-sm">{report.medianDays}</p>
          </div>
          <div className="px-jk-md py-jk-sm rounded-lg border">
            <p className="text-label-md text-muted-foreground">Placements</p>
            <p className="font-heading text-headline-sm">
              {report.placementCount}
            </p>
          </div>
        </div>
        <ExportToolbar
          reportTitle="Time to hire"
          csvFilename="time-to-hire"
          csvColumns={[
            { key: "candidateNo", header: "Candidate no." },
            { key: "name", header: "Name" },
            { key: "daysToHire", header: "Days to hire" },
            { key: "source", header: "Source" },
            { key: "placedAt", header: "Placed at" },
          ]}
          csvRows={csvRows}
          pdfColumns={[
            { header: "Candidate", width: 70 },
            { header: "Name", width: 90 },
            { header: "Days", width: 40 },
            { header: "Source", width: 60 },
            { header: "Placed", width: 70 },
          ]}
          pdfRows={csvRows.map((row) => [
            String(row.candidateNo),
            String(row.name),
            String(row.daysToHire),
            String(row.source),
            String(row.placedAt),
          ])}
        />
      </div>

      <div className="rounded-lg border">
        <div className="bg-muted/40 px-jk-md py-jk-sm border-b font-medium">
          Placement details
        </div>
        <div className="divide-y">
          {report.placements.length === 0 ? (
            <p className="px-jk-md py-jk-sm text-muted-foreground">
              No placements yet
            </p>
          ) : (
            report.placements.map((placement) => (
              <div
                key={placement.candidateId}
                className="gap-jk-sm px-jk-md py-jk-sm flex flex-wrap items-center justify-between"
              >
                <div>
                  <p className="font-medium">
                    {placement.name} ({placement.candidateNo})
                  </p>
                  <p className="text-muted-foreground text-sm">
                    Source: {placement.source}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{placement.daysToHire} days</p>
                  <p className="text-muted-foreground text-sm">
                    {new Date(placement.placedAt).toLocaleDateString("en-LK")}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
