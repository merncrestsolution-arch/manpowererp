import { execFile } from "node:child_process";
import { mkdir, stat } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";

import { auditLogger } from "@/infrastructure/audit/audit-logger";
import { prisma } from "@/infrastructure/db/prisma";
import { resolveOrganizationIdForBranch } from "@/lib/organization";

import type { BackupRecordItem } from "@/types/settings";

const execFileAsync = promisify(execFile);

function mapBackup(record: {
  id: string;
  status: string;
  fileSize: number | null;
  storageLocation: string | null;
  completedAt: Date | null;
  errorMessage: string | null;
  createdAt: Date;
  triggeredBy: { name: string };
}): BackupRecordItem {
  return {
    id: record.id,
    status: record.status,
    fileSize: record.fileSize,
    storageLocation: record.storageLocation,
    completedAt: record.completedAt?.toISOString() ?? null,
    errorMessage: record.errorMessage,
    triggeredByName: record.triggeredBy.name,
    createdAt: record.createdAt.toISOString(),
  };
}

/**
 * Production wiring:
 * - Set BACKUP_COMMAND to a shell command or script path (e.g. pg_dump wrapper)
 * - Set BACKUP_STORAGE_DIR to a writable directory for dump files
 * - In hosted environments, replace runBackupCommand with your backup API/cron integration
 */
async function runBackupCommand(outputPath: string): Promise<void> {
  const customCommand = process.env.BACKUP_COMMAND;

  if (customCommand) {
    await execFileAsync("sh", ["-c", `${customCommand} "${outputPath}"`], {
      env: process.env,
    });
    return;
  }

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error(
      "DATABASE_URL is not configured. Set BACKUP_COMMAND for custom backup wiring.",
    );
  }

  await execFileAsync(
    "pg_dump",
    [databaseUrl, "-f", outputPath, "--format=custom"],
    { env: process.env },
  );
}

type TriggerBackupParams = {
  branchId: string;
  userId: string;
};

export async function triggerBackup({ branchId, userId }: TriggerBackupParams) {
  const organizationId = await resolveOrganizationIdForBranch(branchId);

  const record = await prisma.backupRecord.create({
    data: {
      organizationId,
      triggeredById: userId,
      status: "PENDING",
      createdBy: userId,
      updatedBy: userId,
    },
    include: { triggeredBy: { select: { name: true } } },
  });

  const storageDir =
    process.env.BACKUP_STORAGE_DIR ??
    path.join(process.cwd(), "storage", "backups");
  await mkdir(storageDir, { recursive: true });

  const outputPath = path.join(storageDir, `${record.id}.dump`);

  try {
    await runBackupCommand(outputPath);
    const fileStat = await stat(outputPath);

    const updated = await prisma.backupRecord.update({
      where: { id: record.id },
      data: {
        status: "COMPLETED",
        fileSize: fileStat.size,
        storageLocation: outputPath,
        completedAt: new Date(),
        updatedBy: userId,
      },
      include: { triggeredBy: { select: { name: true } } },
    });

    await auditLogger({
      organizationId,
      branchId,
      userId,
      action: "BACKUP_COMPLETED",
      entityType: "BackupRecord",
      entityId: record.id,
    });

    return { success: true as const, backup: mapBackup(updated) };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Backup command failed";

    const updated = await prisma.backupRecord.update({
      where: { id: record.id },
      data: {
        status: "FAILED",
        errorMessage: message,
        completedAt: new Date(),
        updatedBy: userId,
      },
      include: { triggeredBy: { select: { name: true } } },
    });

    await auditLogger({
      organizationId,
      branchId,
      userId,
      action: "BACKUP_FAILED",
      entityType: "BackupRecord",
      entityId: record.id,
      changes: { error: message },
    });

    return {
      success: false as const,
      error: message,
      backup: mapBackup(updated),
    };
  }
}

export async function listBackupHistory(
  branchId: string,
): Promise<BackupRecordItem[]> {
  const organizationId = await resolveOrganizationIdForBranch(branchId);

  const records = await prisma.backupRecord.findMany({
    where: { organizationId },
    include: { triggeredBy: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return records.map(mapBackup);
}
