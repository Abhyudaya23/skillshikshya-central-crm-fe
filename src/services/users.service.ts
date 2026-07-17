import { api } from "@/lib/api";
import type { Paginated, UpdateUserPayload, User } from "@/types";

export const usersService = {
  async list(params: { page?: number; page_size?: number } = {}) {
    const { data } = await api.get<Paginated<User>>("/users/", { params });
    return data;
  },

  async get(id: number) {
    const { data } = await api.get<User>(`/users/${id}/`);
    return data;
  },

  async update(id: number, payload: UpdateUserPayload) {
    const { data } = await api.patch<User>(`/users/${id}/`, payload);
    return data;
  },

  async remove(id: number) {
    await api.delete(`/users/${id}/`);
  },
};
