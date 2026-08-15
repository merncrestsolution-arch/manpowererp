import { auditLogger } from "@/infrastructure/audit/audit-logger";
import { prisma } from "@/infrastructure/db/prisma";
import { resolveOrganizationIdForBranch } from "@/lib/organization";

type UploadCompanyLogoParams = {
  branchId: string;
  userId: string;
  logoUrl: string;
};

export async function uploadCompanyLogo({
  branchId,
  userId,
  logoUrl,
}: UploadCompanyLogoParams) {
  const organizationId = await resolveOrganizationIdForBranch(branchId);

  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: { name: true },
  });

  const existing = await prisma.companySettings.findFirst({
    where: { organizationId, deletedAt: null },
  });

  const settings = existing
    ? await prisma.companySettings.update({
        where: { id: existing.id },
        data: { logoUrl, updatedBy: userId },
      })
    : await prisma.companySettings.create({
        data: {
          organizationId,
          name: org?.name ?? "JK Manpower",
          logoUrl,
          fiscalYearStart: 1,
          createdBy: userId,
          updatedBy: userId,
        },
      });

  await auditLogger({
    organizationId,
    branchId,
    userId,
    action: "UPDATE",
    entityType: "CompanySettings",
    entityId: settings.id,
    changes: { logoUrl },
  });

  return settings;
}
