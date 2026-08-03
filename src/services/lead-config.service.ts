import { api } from "@/lib/api";
import type { Paginated } from "@/types";
import type {
  ApiCampaign,
  ApiLeadPriority,
  ApiLeadSource,
  ApiLeadStatus,
  ApiLeadTag,
  ApiLeadTypeConfig,
} from "@/types/leads-api";

export interface ListParams {
  page?: number;
  page_size?: number;
  search?: string;
  is_active?: boolean;
  ordering?: string;
}

/** Small CRUD factory shared by every lead-config lookup endpoint. */
function crud<T extends { id: number }, P>(base: string) {
  return {
    async list(params: ListParams = {}) {
      const { data } = await api.get<Paginated<T>>(base, { params });
      return data;
    },
    async get(id: number) {
      const { data } = await api.get<T>(`${base}${id}/`);
      return data;
    },
    async create(payload: P) {
      const { data } = await api.post<T>(base, payload);
      return data;
    },
    async update(id: number, payload: Partial<P>) {
      const { data } = await api.patch<T>(`${base}${id}/`, payload);
      return data;
    },
    async remove(id: number) {
      await api.delete(`${base}${id}/`);
    },
  };
}

export const leadSourcesService = crud<ApiLeadSource, Omit<ApiLeadSource, "id">>("/lead-sources/");
export const campaignsService = crud<ApiCampaign, Omit<ApiCampaign, "id" | "source_name">>("/campaigns/");
export const leadStatusesService = crud<ApiLeadStatus, Omit<ApiLeadStatus, "id">>("/lead-statuses/");
export const leadPrioritiesService = crud<ApiLeadPriority, Omit<ApiLeadPriority, "id">>("/lead-priorities/");
export const leadTagsService = crud<ApiLeadTag, Omit<ApiLeadTag, "id">>("/lead-tags/");
export const leadTypesService = crud<ApiLeadTypeConfig, Omit<ApiLeadTypeConfig, "id">>("/lead-types/");
