"use client";

import { BackupHistoryTable } from "@/components/settings/backup-history-table";
import { BackupTriggerPanel } from "@/components/settings/backup-trigger-panel";
import { useBackupHistory } from "@/hooks/use-settings";

export default function BackupSettingsPage() {
  const { data: history = [], isLoading } = useBackupHistory();

  const completed = history.filter(
    (record) => record.status === "COMPLETED",
  ).length;
  const failed = history.filter((record) => record.status === "FAILED").length;
  const lastRun = history[0]
    ? new Date(history[0].createdAt).toLocaleString("en-LK", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "Never";

  return (
    <div className="flex flex-col gap-5">
      <section className="shadow-elevated relative overflow-hidden rounded-2xl bg-[#041433] bg-[linear-gradient(135deg,#041433_0%,#0a2b58_62%,#0869a8_140%)] px-5 py-5 text-white">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(80,178,254,0.28),transparent_52%)]" />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-xl">
            <p className="text-[11px] font-semibold tracking-[0.18em] text-[#50b2fe] uppercase">
              Data protection
            </p>
            <h2 className="font-heading mt-2 text-[22px] leading-7 font-semibold tracking-tight">
              Database backup
            </h2>
            <p className="mt-2 text-[14px] leading-5 text-white/70">
              Create snapshots and review recent backup jobs. Keep a current
              copy before payroll runs or major settings changes.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Last run", value: lastRun },
              { label: "Completed", value: completed },
              { label: "Failed", value: failed },
            ].map((stat) => (
              <div
                key={stat.label}
                className="min-w-[96px] rounded-xl border border-white/15 bg-white/10 px-3 py-2.5"
              >
                <p className="text-[11px] font-medium text-white/65">
                  {stat.label}
                </p>
                <p className="font-heading mt-1 text-[16px] leading-6 font-semibold tabular-nums">
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <BackupTriggerPanel />
      <BackupHistoryTable records={history} isLoading={isLoading} />
    </div>
  );
}
