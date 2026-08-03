import { api } from "@/lib/api";
import type { Paginated } from "@/types";
import type { ApiBranch, ApiBranchPayload } from "@/types/leads-api";

export interface BranchListParams {
  page?: number;
  page_size?: number;
  search?: string;
  is_active?: boolean;
  ordering?: string;
}

export const branchesService = {
  async list(params: BranchListParams = {}) {
    const { data } = await api.get<Paginated<ApiBranch>>("/branches/", { params });
    return data;
  },
  async get(id: number) {
    const { data } = await api.get<ApiBranch>(`/branches/${id}/`);
    return data;
  },
  async create(payload: ApiBranchPayload) {
    const { data } = await api.post<ApiBranch>("/branches/", payload);
    return data;
  },
  async update(id: number, payload: ApiBranchPayload) {
    const { data } = await api.patch<ApiBranch>(`/branches/${id}/`, payload);
    return data;
  },
  async remove(id: number) {
    await api.delete(`/branches/${id}/`);
  },
};
