import { api } from "@/lib/api";
import type { Paginated, Permission } from "@/types";

export const permissionsService = {
  async list(params: { page?: number; page_size?: number } = {}) {
    const { data } = await api.get<Paginated<Permission>>("/permissions/", { params });
    return data;
  },

  /** Fetch every permission across pages (for the role editor checklist). */
  async listAll() {
    const all: Permission[] = [];
    let page = 1;
    for (;;) {
      const data = await this.list({ page, page_size: 100 });
      all.push(...data.results);
      if (!data.next) break;
      page += 1;
    }
    return all;
  },
};
