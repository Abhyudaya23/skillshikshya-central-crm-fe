import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiErrorMessage } from "@/lib/api";
import {
  campaignsService,
  leadPrioritiesService,
  leadSourcesService,
  leadStatusesService,
  leadTagsService,
  leadTypesService,
} from "@/services/lead-config.service";
import type {
  ApiCampaign,
  ApiLeadPriority,
  ApiLeadSource,
  ApiLeadStatus,
  ApiLeadTag,
  ApiLeadTypeConfig,
} from "@/types/leads-api";

const BIG = { page: 1, page_size: 100 } as const;

/* ------------------------------------------------------------------ lists */

export function useLeadSources(enabled = true) {
  return useQuery({
    queryKey: ["lead-sources"],
    queryFn: () => leadSourcesService.list(BIG),
    enabled,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCampaigns(enabled = true) {
  return useQuery({
    queryKey: ["campaigns"],
    queryFn: () => campaignsService.list(BIG),
    enabled,
    staleTime: 5 * 60 * 1000,
  });
}

export function useLeadStatuses(enabled = true) {
  return useQuery({
    queryKey: ["lead-statuses"],
    queryFn: async () => {
      const data = await leadStatusesService.list(BIG);
      data.results = [...data.results].sort((a, b) => a.sort_order - b.sort_order);
      return data;
    },
    enabled,
    staleTime: 5 * 60 * 1000,
  });
}

export function useLeadPriorities(enabled = true) {
  return useQuery({
    queryKey: ["lead-priorities"],
    queryFn: async () => {
      const data = await leadPrioritiesService.list(BIG);
      data.results = [...data.results].sort((a, b) => a.sort_order - b.sort_order);
      return data;
    },
    enabled,
    staleTime: 5 * 60 * 1000,
  });
}

export function useLeadTypes(enabled = true) {
  return useQuery({
    queryKey: ["lead-types"],
    queryFn: () => leadTypesService.list(BIG),
    enabled,
    staleTime: 5 * 60 * 1000,
  });
}

export function useLeadTags(enabled = true) {
  return useQuery({
    queryKey: ["lead-tags"],
    queryFn: () => leadTagsService.list(BIG),
    enabled,
    staleTime: 5 * 60 * 1000,
  });
}

/* ---------------------------------------------------- CRUD mutation hooks */

interface CrudService<T, P> {
  create: (p: P) => Promise<T>;
  update: (id: number, p: Partial<P>) => Promise<T>;
  remove: (id: number) => Promise<void>;
}

function makeCrudHooks<T, P>(service: CrudService<T, P>, key: string, label: string) {
  function useCreate() {
    const qc = useQueryClient();
    return useMutation({
      mutationFn: (payload: P) => service.create(payload),
      onSuccess: () => {
        toast.success(`${label} created`);
        void qc.invalidateQueries({ queryKey: [key] });
      },
      onError: (e) => toast.error(apiErrorMessage(e, `Could not create ${label.toLowerCase()}`)),
    });
  }
  function useUpdate() {
    const qc = useQueryClient();
    return useMutation({
      mutationFn: ({ id, payload }: { id: number; payload: Partial<P> }) => service.update(id, payload),
      onSuccess: () => {
        toast.success(`${label} updated`);
        void qc.invalidateQueries({ queryKey: [key] });
      },
      onError: (e) => toast.error(apiErrorMessage(e, `Could not update ${label.toLowerCase()}`)),
    });
  }
  function useRemove() {
    const qc = useQueryClient();
    return useMutation({
      mutationFn: (id: number) => service.remove(id),
      onSuccess: () => {
        toast.success(`${label} deleted`);
        void qc.invalidateQueries({ queryKey: [key] });
      },
      onError: (e) => toast.error(apiErrorMessage(e, `Could not delete ${label.toLowerCase()}`)),
    });
  }
  return { useCreate, useUpdate, useRemove };
}

export const sourceHooks = makeCrudHooks<ApiLeadSource, Omit<ApiLeadSource, "id">>(
  leadSourcesService,
  "lead-sources",
  "Source",
);
export const campaignHooks = makeCrudHooks<ApiCampaign, Omit<ApiCampaign, "id" | "source_name">>(
  campaignsService,
  "campaigns",
  "Campaign",
);
export const statusHooks = makeCrudHooks<ApiLeadStatus, Omit<ApiLeadStatus, "id">>(
  leadStatusesService,
  "lead-statuses",
  "Status",
);
export const priorityHooks = makeCrudHooks<ApiLeadPriority, Omit<ApiLeadPriority, "id">>(
  leadPrioritiesService,
  "lead-priorities",
  "Priority",
);
export const tagHooks = makeCrudHooks<ApiLeadTag, Omit<ApiLeadTag, "id">>(
  leadTagsService,
  "lead-tags",
  "Tag",
);
export const typeHooks = makeCrudHooks<ApiLeadTypeConfig, Omit<ApiLeadTypeConfig, "id">>(
  leadTypesService,
  "lead-types",
  "Lead type",
);
