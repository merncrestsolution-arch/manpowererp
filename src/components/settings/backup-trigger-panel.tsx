"use client";

import { DatabaseBackup } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useTriggerBackup } from "@/hooks/use-settings";

export function BackupTriggerPanel() {
  const triggerBackup = useTriggerBackup();

  return (
    <section className="border-border bg-card shadow-card overflow-hidden rounded-2xl border">
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="jk-icon-well">
            <DatabaseBackup className="size-4" aria-hidden />
          </span>
          <div className="min-w-0">
            <h2 className="font-heading text-foreground text-[16px] leading-6 font-semibold">
              Create a backup
            </h2>
            <p className="text-muted-foreground mt-1 max-w-xl text-[13px] leading-5">
              Runs a server-side database snapshot. Use this before major
              changes. Production needs pg_dump or BACKUP_COMMAND configured.
            </p>
          </div>
        </div>
        <Button
          className="h-9 shrink-0"
          onClick={() => void triggerBackup.mutateAsync()}
          disabled={triggerBackup.isPending}
        >
          <DatabaseBackup className="size-4" />
          {triggerBackup.isPending ? "Running backup…" : "Trigger backup"}
        </Button>
      </div>
      {triggerBackup.isError ? (
        <div className="border-destructive/20 bg-destructive/5 text-destructive border-t px-5 py-3 text-sm">
          {triggerBackup.error instanceof Error
            ? triggerBackup.error.message
            : "Backup failed"}
        </div>
      ) : null}
    </section>
  );
}
