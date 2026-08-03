import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notificationsService } from "@/services/notifications.service";

/** List the current user's notifications (newest first), polled while mounted. */
export function useNotifications(enabled = true) {
  return useQuery({
    queryKey: ["notifications", "list"],
    queryFn: () => notificationsService.list({ ordering: "-created_at", page_size: 20 }),
    enabled,
    refetchInterval: 60_000,
  });
}

/** Unread badge count, polled so it stays fresh without opening the dropdown. */
export function useUnreadCount(enabled = true) {
  return useQuery({
    queryKey: ["notifications", "unread"],
    queryFn: () => notificationsService.unreadCount(),
    enabled,
    refetchInterval: 60_000,
  });
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => notificationsService.markRead(id),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["notifications"] }),
  });
}

export function useMarkAllNotificationsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => notificationsService.markAllRead(),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["notifications"] }),
  });
}
