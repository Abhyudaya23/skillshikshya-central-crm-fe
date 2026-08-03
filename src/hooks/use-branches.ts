import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiErrorMessage } from "@/lib/api";
import { branchesService } from "@/services/branches.service";
import type { ApiBranchPayload } from "@/types/leads-api";

export function useBranches(page = 1, pageSize = 100, search = "", enabled = true) {
  return useQuery({
    queryKey: ["branches", page, pageSize, search],
    queryFn: () =>
      branchesService.list({ page, page_size: pageSize, search: search || undefined }),
    enabled,
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateBranch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: ApiBranchPayload) => branchesService.create(payload),
    onSuccess: (b) => {
      toast.success(`Branch "${b.name}" created`);
      void qc.invalidateQueries({ queryKey: ["branches"] });
    },
    onError: (e) => toast.error(apiErrorMessage(e, "Could not create branch")),
  });
}

export function useUpdateBranch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: ApiBranchPayload }) =>
      branchesService.update(id, payload),
    onSuccess: () => {
      toast.success("Branch updated");
      void qc.invalidateQueries({ queryKey: ["branches"] });
    },
    onError: (e) => toast.error(apiErrorMessage(e, "Could not update branch")),
  });
}

export function useDeleteBranch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => branchesService.remove(id),
    onSuccess: () => {
      toast.success("Branch deleted");
      void qc.invalidateQueries({ queryKey: ["branches"] });
    },
    onError: (e) => toast.error(apiErrorMessage(e, "Could not delete branch")),
  });
}
