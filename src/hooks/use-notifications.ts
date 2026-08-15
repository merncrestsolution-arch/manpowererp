import type { NotificationItem } from "@/types/navigation";

type UseNotificationsResult = {
  notifications: NotificationItem[];
  unreadCount: number;
  markAllAsRead: () => void;
  markAsRead: (id: string) => void;
};

/**
 * Notification data wiring arrives in a later phase.
 * This hook returns a typed empty collection until the notifications API is implemented.
 */
export function useNotifications(): UseNotificationsResult {
  const notifications: NotificationItem[] = [];

  return {
    notifications,
    unreadCount: 0,
    markAllAsRead: () => undefined,
    markAsRead: () => undefined,
  };
}
