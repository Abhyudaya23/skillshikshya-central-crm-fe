import { api } from "@/lib/api";
import type { Course, CourseListParams, CoursePayload, Paginated } from "@/types";

export const coursesService = {
  async list(params: CourseListParams = {}) {
    const { data } = await api.get<Paginated<Course>>("/courses/", { params });
    return data;
  },

  async get(id: number) {
    const { data } = await api.get<Course>(`/courses/${id}/`);
    return data;
  },

  async create(payload: CoursePayload) {
    const { data } = await api.post<Course>("/courses/", payload);
    return data;
  },

  async update(id: number, payload: CoursePayload) {
    const { data } = await api.patch<Course>(`/courses/${id}/`, payload);
    return data;
  },

  async remove(id: number) {
    await api.delete(`/courses/${id}/`);
  },
};
