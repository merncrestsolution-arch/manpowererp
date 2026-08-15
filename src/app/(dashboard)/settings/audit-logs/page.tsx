"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

import { AuditLogFilters } from "@/components/settings/audit-log-filters";
import { AuditLogTable } from "@/components/settings/audit-log-table";
import { Button } from "@/components/ui/button";
import { useAuditLogs } from "@/hooks/use-settings";

export default function AuditLogsPage() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    action: "",
    entityType: "",
    dateFrom: "",
    dateTo: "",
  });

  const { data, isLoading } = useAuditLogs({
    page,
    pageSize: 20,
    action: filters.action || undefined,
    entityType: filters.entityType || undefined,
    dateFrom: filters.dateFrom || undefined,
    dateTo: filters.dateTo || undefined,
  });

  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;
  const activeFilters = [
    filters.action,
    filters.entityType,
    filters.dateFrom,
    filters.dateTo,
  ].filter(Boolean).length;

  return (
    <div className="flex flex-col gap-5">
      <section className="shadow-elevated relative overflow-hidden rounded-2xl bg-[#041433] bg-[linear-gradient(135deg,#041433_0%,#0a2b58_62%,#0869a8_140%)] px-5 py-5 text-white">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(80,178,254,0.28),transparent_52%)]" />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-xl">
            <p className="text-[11px] font-semibold tracking-[0.18em] text-[#50b2fe] uppercase">
              Security trail
            </p>
            <h2 className="font-heading mt-2 text-[22px] leading-7 font-semibold tracking-tight">
              Audit logs
            </h2>
            <p className="mt-2 text-[14px] leading-5 text-white/70">
              Read-only history of who changed what, and when. Filter by action,
              entity, or date range.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Entries", value: total },
              { label: "Page", value: `${page} / ${totalPages}` },
              { label: "Filters", value: activeFilters },
            ].map((stat) => (
              <div
                key={stat.label}
                className="min-w-[96px] rounded-xl border border-white/15 bg-white/10 px-3 py-2.5"
              >
                <p className="text-[11px] font-medium text-white/65">
                  {stat.label}
                </p>
                <p className="font-heading mt-1 text-[18px] leading-6 font-semibold tabular-nums">
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <AuditLogFilters
        filters={filters}
        onChange={(next) => {
          setFilters(next);
          setPage(1);
        }}
      />
      <AuditLogTable logs={data?.items ?? []} isLoading={isLoading} />

      {data && data.totalPages > 1 ? (
        <div className="border-border bg-card shadow-card flex flex-col gap-3 rounded-2xl border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-muted-foreground text-[13px]">
            Page {data.page} of {data.totalPages}
            {data.total > 0 ? ` · ${data.total} total` : ""}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon-sm"
              disabled={page <= 1}
              onClick={() => setPage((current) => current - 1)}
            >
              <ChevronLeft className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="icon-sm"
              disabled={page >= data.totalPages}
              onClick={() => setPage((current) => current + 1)}
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
