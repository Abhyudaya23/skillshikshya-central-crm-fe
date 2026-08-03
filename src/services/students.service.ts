import { api } from "@/lib/api";
import type { Paginated } from "@/types";
import type { ApiStudent, ApiStudentPayload } from "@/types/leads-api";

export interface StudentListParams {
  page?: number;
  page_size?: number;
  search?: string;
  status?: string;
  status__in?: string;
  branch?: number;
  source?: number;
  assigned_counselor?: number;
  ordering?: string;
}

export const studentsService = {
  async list(params: StudentListParams = {}) {
    const { data } = await api.get<Paginated<ApiStudent>>("/students/", { params });
    return data;
  },
  async get(id: number) {
    const { data } = await api.get<ApiStudent>(`/students/${id}/`);
    return data;
  },
  async create(payload: ApiStudentPayload) {
    const { data } = await api.post<ApiStudent>("/students/", payload);
    return data;
  },
  async update(id: number, payload: ApiStudentPayload) {
    const { data } = await api.patch<ApiStudent>(`/students/${id}/`, payload);
    return data;
  },
  async remove(id: number) {
    await api.delete(`/students/${id}/`);
  },
};
