"use client";

import { ChevronDown, ChevronRight, ScrollText } from "lucide-react";
import { Fragment, useState } from "react";

import { EmptyState } from "@/components/shared/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import type { AuditLogItem } from "@/types/settings";

type AuditLogTableProps = {
  logs: AuditLogItem[];
  isLoading?: boolean;
};

function formatAction(action: string) {
  return action
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function AuditLogTable({ logs, isLoading = false }: AuditLogTableProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="border-border bg-card shadow-card overflow-hidden rounded-2xl border p-5">
        <div className="space-y-3">
          <Skeleton className="h-11 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <EmptyState
        icon={ScrollText}
        title="No audit logs found"
        description="System activity will appear here as users create, update, or delete records. Try clearing filters if you expected results."
      />
    );
  }

  return (
    <section className="border-border bg-card shadow-card overflow-hidden rounded-2xl border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Time</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Action</TableHead>
            <TableHead>Entity</TableHead>
            <TableHead className="text-right">Changes</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((log) => {
            const isExpanded = expandedId === log.id;
            return (
              <Fragment key={log.id}>
                <TableRow>
                  <TableCell className="text-muted-foreground whitespace-nowrap tabular-nums">
                    {new Date(log.createdAt).toLocaleString("en-LK")}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="flex size-7 items-center justify-center rounded-lg bg-[#041433] text-[10px] font-semibold text-white">
                        {initials(log.userName ?? "System")}
                      </span>
                      <span className="font-medium">
                        {log.userName ?? "System"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="bg-primary/10 text-primary inline-flex rounded-md px-2 py-0.5 text-[12px] font-medium">
                      {formatAction(log.action)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <p className="font-medium">{log.entityType}</p>
                    {log.entityId ? (
                      <code className="text-muted-foreground text-[11px]">
                        {log.entityId.slice(0, 8)}…
                      </code>
                    ) : null}
                  </TableCell>
                  <TableCell className="text-right">
                    {log.changes ? (
                      <button
                        type="button"
                        className="text-primary inline-flex items-center gap-1 text-[13px] font-medium hover:underline"
                        onClick={() =>
                          setExpandedId(isExpanded ? null : log.id)
                        }
                      >
                        {isExpanded ? (
                          <ChevronDown className="size-3.5" />
                        ) : (
                          <ChevronRight className="size-3.5" />
                        )}
                        {isExpanded ? "Hide" : "View"}
                      </button>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                </TableRow>
                {isExpanded && log.changes ? (
                  <TableRow key={`${log.id}-changes`}>
                    <TableCell colSpan={5} className="bg-muted/30">
                      <pre className="border-border overflow-x-auto rounded-xl border bg-[#041433] p-4 text-[12px] leading-5 text-[#e8eef8]">
                        {JSON.stringify(log.changes, null, 2)}
                      </pre>
                    </TableCell>
                  </TableRow>
                ) : null}
              </Fragment>
            );
          })}
        </TableBody>
      </Table>
    </section>
  );
}
