import { api } from "@/lib/api";
import type { Group, Paginated } from "@/types";

export const groupsService = {
  async list(params: { page?: number; page_size?: number } = {}) {
    const { data } = await api.get<Paginated<Group>>("/groups/", { params });
    return data;
  },

  async create(payload: { name: string; permissions: number[] }) {
    const { data } = await api.post<Group>("/groups/", payload);
    return data;
  },

  async update(id: number, payload: Partial<{ name: string; permissions: number[] }>) {
    const { data } = await api.patch<Group>(`/groups/${id}/`, payload);
    return data;
  },

  async remove(id: number) {
    await api.delete(`/groups/${id}/`);
  },
};
