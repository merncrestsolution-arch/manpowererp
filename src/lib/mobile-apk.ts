import { prisma } from "@/infrastructure/db/prisma";

export async function getMobileApkUrl(): Promise<string | null> {
  const fromEnv = process.env.MOBILE_APK_URL?.trim();

  if (fromEnv) {
    return fromEnv;
  }

  const settings = await prisma.companySettings.findFirst({
    where: { deletedAt: null, mobileApkUrl: { not: null } },
    select: { mobileApkUrl: true },
    orderBy: { updatedAt: "desc" },
  });

  const url = settings?.mobileApkUrl?.trim();
  return url ? url : null;
}
