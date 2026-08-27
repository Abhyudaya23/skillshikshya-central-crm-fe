import { api } from "@/lib/api";
import type {
  Course,
  CourseCategory,
  CourseCategoryPayload,
  CourseListParams,
  CoursePayload,
  Paginated,
} from "@/types";

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

/** `/api/course-categories/` — see course_app_apis_guide.md §Course Categories. */
export const courseCategoriesService = {
  async list(params: { page?: number; page_size?: number; search?: string } = {}) {
    const { data } = await api.get<Paginated<CourseCategory>>("/course-categories/", { params });
    return data;
  },

  async create(payload: CourseCategoryPayload) {
    const { data } = await api.post<CourseCategory>("/course-categories/", payload);
    return data;
  },

  async update(id: number, payload: CourseCategoryPayload) {
    const { data } = await api.patch<CourseCategory>(`/course-categories/${id}/`, payload);
    return data;
  },

  async remove(id: number) {
    await api.delete(`/course-categories/${id}/`);
  },
};
