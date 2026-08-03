import { api } from "@/lib/api";
import type { Paginated } from "@/types";
import type { ApiCity, ApiProvince } from "@/types/leads-api";

export const locationService = {
  async provinces(params: { search?: string; page_size?: number } = {}) {
    const { data } = await api.get<Paginated<ApiProvince>>("/provinces/", { params });
    return data;
  },
  async cities(params: { search?: string; province?: number; page_size?: number } = {}) {
    const { data } = await api.get<Paginated<ApiCity>>("/cities/", { params });
    return data;
  },
};
