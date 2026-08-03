import { api } from "@/lib/api";
import type { ApiNotification, Paginated } from "@/types";

export const notificationsService = {
  async list(params: { is_read?: boolean; page_size?: number; ordering?: string } = {}) {
    const { data } = await api.get<Paginated<ApiNotification>>("/notifications/", { params });
    return data;
  },
  async unreadCount() {
    const { data } = await api.get<{ unread_count: number }>("/notifications/unread_count/");
    return data.unread_count;
  },
  async markRead(id: number) {
    await api.post(`/notifications/${id}/mark_read/`, {});
  },
  async markAllRead() {
    await api.post("/notifications/mark_all_read/", {});
  },
};
