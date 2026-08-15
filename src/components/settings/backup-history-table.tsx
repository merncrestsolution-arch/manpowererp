"use client";

import { HardDrive } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import type { StatusBadgeVariant } from "@/components/shared/status-badge";
import type { BackupRecordItem } from "@/types/settings";

type BackupHistoryTableProps = {
  records: BackupRecordItem[];
  isLoading?: boolean;
};

function formatBytes(bytes: number | null): string {
  if (!bytes) {
    return "—";
  }
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function backupStatus(status: string): {
  variant: StatusBadgeVariant;
  label: string;
} {
  const normalized = status.toUpperCase();
  if (normalized === "COMPLETED") {
    return { variant: "approved", label: "Completed" };
  }
  if (normalized === "FAILED") {
    return { variant: "rejected", label: "Failed" };
  }
  return { variant: "pending", label: "Pending" };
}

export function BackupHistoryTable({
  records,
  isLoading = false,
}: BackupHistoryTableProps) {
  if (isLoading) {
    return (
      <div className="border-border bg-card shadow-card overflow-hidden rounded-2xl border p-5">
        <div className="space-y-3">
          <Skeleton className="h-11 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <EmptyState
        icon={HardDrive}
        title="No backups yet"
        description="Trigger a backup to create the first snapshot. History will appear here with status, size, and completion time."
      />
    );
  }

  return (
    <section className="border-border bg-card shadow-card overflow-hidden rounded-2xl border">
      <div className="border-border flex items-center justify-between border-b bg-[linear-gradient(90deg,rgba(4,20,51,0.04),transparent_70%)] px-5 py-4">
        <div>
          <h2 className="font-heading text-foreground text-[16px] leading-6 font-semibold">
            Backup history
          </h2>
          <p className="text-muted-foreground text-[13px] leading-5">
            {records.length} recent snapshot{records.length === 1 ? "" : "s"}
          </p>
        </div>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Triggered</TableHead>
            <TableHead>By</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Size</TableHead>
            <TableHead>Completed</TableHead>
            <TableHead>Details</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.map((record) => {
            const status = backupStatus(record.status);
            return (
              <TableRow key={record.id}>
                <TableCell className="whitespace-nowrap tabular-nums">
                  {new Date(record.createdAt).toLocaleString("en-LK")}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="flex size-7 items-center justify-center rounded-lg bg-[#041433] text-[10px] font-semibold text-white">
                      {record.triggeredByName
                        .split(" ")
                        .map((part) => part[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()}
                    </span>
                    <span className="font-medium">
                      {record.triggeredByName}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <StatusBadge
                    status={status.variant}
                    label={status.label}
                    size="sm"
                  />
                </TableCell>
                <TableCell className="tabular-nums">
                  {formatBytes(record.fileSize)}
                </TableCell>
                <TableCell className="text-muted-foreground whitespace-nowrap tabular-nums">
                  {record.completedAt
                    ? new Date(record.completedAt).toLocaleString("en-LK")
                    : "—"}
                </TableCell>
                <TableCell className="text-muted-foreground max-w-[280px] truncate">
                  {record.errorMessage ?? record.storageLocation ?? "—"}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </section>
  );
}
