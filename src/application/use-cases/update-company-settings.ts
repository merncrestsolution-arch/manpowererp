import { auditLogger } from "@/infrastructure/audit/audit-logger";
import { prisma } from "@/infrastructure/db/prisma";
import { resolveOrganizationIdForBranch } from "@/lib/organization";

import type { UpdateCompanySettingsInput } from "@/application/dto/company-settings.schema";
import type { CompanySettingsItem } from "@/types/settings";

function mapSettings(record: {
  id: string;
  organizationId: string;
  name: string;
  registrationNo: string | null;
  address: string | null;
  city: string | null;
  phone: string | null;
  email: string | null;
  logoUrl: string | null;
  taxId: string | null;
  fiscalYearStart: number;
  updatedAt: Date;
}): CompanySettingsItem {
  return {
    id: record.id,
    organizationId: record.organizationId,
    name: record.name,
    registrationNo: record.registrationNo,
    address: record.address,
    city: record.city,
    phone: record.phone,
    email: record.email,
    logoUrl: record.logoUrl,
    taxId: record.taxId,
    fiscalYearStart: record.fiscalYearStart,
    updatedAt: record.updatedAt.toISOString(),
  };
}

export async function getCompanySettings(
  branchId: string,
): Promise<CompanySettingsItem | null> {
  const organizationId = await resolveOrganizationIdForBranch(branchId);

  const settings = await prisma.companySettings.findFirst({
    where: { organizationId, deletedAt: null },
  });

  if (!settings) {
    const org = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: { name: true },
    });

    if (!org) {
      return null;
    }

    return {
      id: "",
      organizationId,
      name: org.name,
      registrationNo: null,
      address: null,
      city: null,
      phone: null,
      email: null,
      logoUrl: null,
      taxId: null,
      fiscalYearStart: 1,
      updatedAt: new Date().toISOString(),
    };
  }

  return mapSettings(settings);
}

type UpdateCompanySettingsParams = {
  branchId: string;
  userId: string;
  input: UpdateCompanySettingsInput;
};

export async function updateCompanySettings({
  branchId,
  userId,
  input,
}: UpdateCompanySettingsParams) {
  const organizationId = await resolveOrganizationIdForBranch(branchId);

  const existing = await prisma.companySettings.findFirst({
    where: { organizationId, deletedAt: null },
  });

  const data = {
    name: input.name,
    registrationNo: input.registrationNo || null,
    address: input.address || null,
    city: input.city || null,
    phone: input.phone || null,
    email: input.email || null,
    logoUrl: input.logoUrl || null,
    taxId: input.taxId || null,
    fiscalYearStart: input.fiscalYearStart,
    updatedBy: userId,
  };

  const settings = existing
    ? await prisma.companySettings.update({
        where: { id: existing.id },
        data,
      })
    : await prisma.companySettings.create({
        data: {
          organizationId,
          ...data,
          createdBy: userId,
        },
      });

  await prisma.organization.update({
    where: { id: organizationId },
    data: { name: input.name, updatedBy: userId },
  });

  await auditLogger({
    organizationId,
    branchId,
    userId,
    action: "UPDATE",
    entityType: "CompanySettings",
    entityId: settings.id,
    changes: { after: data },
  });

  return mapSettings(settings);
}
