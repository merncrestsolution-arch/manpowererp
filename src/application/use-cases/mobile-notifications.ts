import { z } from "zod";

import { prisma } from "@/infrastructure/db/prisma";

import type { MobileNotificationItem } from "@/types/mobile";
import type { DevicePlatform, Prisma } from "@prisma/client";

const registerDeviceSchema = z.object({
  token: z.string().min(1),
  platform: z.enum(["ANDROID", "IOS"]),
});

export type RegisterDeviceInput = z.infer<typeof registerDeviceSchema>;

export { registerDeviceSchema };

export async function registerDeviceToken(
  userId: string,
  input: RegisterDeviceInput,
): Promise<void> {
  await prisma.deviceToken.upsert({
    where: { token: input.token },
    create: {
      userId,
      token: input.token,
      platform: input.platform as DevicePlatform,
    },
    update: {
      userId,
      platform: input.platform as DevicePlatform,
    },
  });
}

export async function unregisterDeviceToken(
  userId: string,
  token: string,
): Promise<void> {
  await prisma.deviceToken.deleteMany({
    where: { userId, token },
  });
}

function mapNotification(notification: {
  id: string;
  title: string;
  body: string;
  type: string;
  data: unknown;
  isRead: boolean;
  createdAt: Date;
}): MobileNotificationItem {
  return {
    id: notification.id,
    title: notification.title,
    body: notification.body,
    type: notification.type,
    data:
      notification.data && typeof notification.data === "object"
        ? (notification.data as Record<string, unknown>)
        : null,
    isRead: notification.isRead,
    createdAt: notification.createdAt.toISOString(),
  };
}

export async function listUserNotifications(
  userId: string,
  page = 1,
  pageSize = 20,
): Promise<{
  items: MobileNotificationItem[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}> {
  const where = { userId };
  const [total, notifications] = await Promise.all([
    prisma.appNotification.count({ where }),
    prisma.appNotification.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return {
    items: notifications.map(mapNotification),
    page,
    pageSize,
    total,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function markNotificationRead(
  userId: string,
  notificationId: string,
): Promise<MobileNotificationItem | null> {
  const existing = await prisma.appNotification.findFirst({
    where: { id: notificationId, userId },
  });

  if (!existing) {
    return null;
  }

  const updated = await prisma.appNotification.update({
    where: { id: notificationId },
    data: { isRead: true },
  });

  return mapNotification(updated);
}

export async function createAppNotification(input: {
  userId: string;
  title: string;
  body: string;
  type: string;
  data?: Record<string, unknown>;
}): Promise<MobileNotificationItem> {
  const notification = await prisma.appNotification.create({
    data: {
      userId: input.userId,
      title: input.title,
      body: input.body,
      type: input.type,
      data: input.data as Prisma.InputJsonValue | undefined,
    },
  });

  return mapNotification(notification);
}
